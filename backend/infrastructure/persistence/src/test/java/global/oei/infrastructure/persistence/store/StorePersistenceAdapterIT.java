package global.oei.infrastructure.persistence.store;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.payment.Payment;
import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.payment.PaymentStatus;
import global.oei.domain.shared.store.BusinessCardTemplate;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderLine;
import global.oei.domain.shared.store.OrderStatus;
import global.oei.domain.shared.store.Product;
import global.oei.domain.shared.store.ProductCategory;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied -- exercises the demo V1 catalog (0053) seeded by migration, and a full
 * order + payment round trip against the real seeded demo member (Alice, 0004).
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class StorePersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ProductCategoryRepository categoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private BusinessCardTemplateRepository businessCardTemplateRepository;
    @Autowired
    private StoreOrderRepository orderRepository;
    @Autowired
    private StoreOrderLineRepository lineRepository;
    @Autowired
    private StorePaymentRepository paymentRepository;

    private static final MemberId ALICE = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));

    @Test
    void productCatalog_isSeededByTheDemoMigration() {
        final ProductPersistenceAdapter adapter =
                new ProductPersistenceAdapter(categoryRepository, productRepository, businessCardTemplateRepository);

        final List<ProductCategory> categories = adapter.findAllCategories();
        assertThat(categories).extracting(ProductCategory::code)
                .contains("goodies", "business-card", "print-cv", "print-whitepaper");

        final List<Product> pens = adapter.findAllProducts("goodies");
        assertThat(pens).extracting(Product::sku).contains("OEI-PEN-001");

        final List<BusinessCardTemplate> templates = adapter.findAllBusinessCardTemplates();
        assertThat(templates).isNotEmpty();
    }

    @Test
    void order_savedThenPaid_roundTripsThroughPersistence() {
        final OrderPersistenceAdapter orderAdapter = new OrderPersistenceAdapter(orderRepository, lineRepository);
        final PaymentPersistenceAdapter paymentAdapter = new PaymentPersistenceAdapter(paymentRepository);

        final Product pen = new ProductPersistenceAdapter(categoryRepository, productRepository, businessCardTemplateRepository)
                .findAllProducts("goodies").get(0);

        final String orderId = UUID.randomUUID().toString();
        final OrderLine line = new OrderLine(
                UUID.randomUUID().toString(), orderId, pen.id(), 2, pen.unitPriceAmount(), null, null);
        final Order pendingOrder = new Order(
                orderId, ALICE, List.of(line), pen.unitPriceAmount().multiply(BigDecimal.valueOf(2)),
                pen.unitPriceCurrency(), OrderStatus.PENDING_PAYMENT, Instant.now(), null);

        orderAdapter.save(pendingOrder);

        final Payment payment = new Payment(
                UUID.randomUUID().toString(), pendingOrder.id(), PaymentMethod.CARD, "pi_test_123", pendingOrder.totalAmount(),
                pendingOrder.totalCurrency(), PaymentStatus.SUCCEEDED, null, Instant.now(), Instant.now());
        paymentAdapter.save(payment);

        final Order paidOrder = pendingOrder.pay(Instant.now()).markFulfillmentPending();
        orderAdapter.save(paidOrder);

        final Order reloaded = orderAdapter.findById(pendingOrder.id()).orElseThrow();
        assertThat(reloaded.status()).isEqualTo(OrderStatus.PENDING_FULFILLMENT);
        assertThat(reloaded.lines()).hasSize(1);

        final List<Payment> paymentsForOrder = paymentAdapter.findByOrderId(pendingOrder.id());
        assertThat(paymentsForOrder).extracting(Payment::status).containsOnly(PaymentStatus.SUCCEEDED);

        assertThat(orderAdapter.findByMemberId(ALICE)).extracting(Order::id).contains(pendingOrder.id());
        assertThat(orderAdapter.findAll(OrderStatus.PENDING_FULFILLMENT)).extracting(Order::id).contains(pendingOrder.id());
    }
}
