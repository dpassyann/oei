package global.oei.domain.core.store;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.store.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CreateOrderServiceTest {

    private final ProductPort productPort = mock(ProductPort.class);
    private final OrderPort orderPort = mock(OrderPort.class);
    private final CreateOrderService service = new CreateOrderService(productPort, orderPort);

    private final Product activePen = new Product("p1", "cat1", "PEN-001", "Stylo OEI", "desc", new BigDecimal("9.90"), "EUR", true, false);

    @Test
    void execute_computesTotalServerSideFromCatalogPrice() {
        when(productPort.findProductById("p1")).thenReturn(Optional.of(activePen));
        when(orderPort.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final Order order = service.execute(MemberId.newId(), List.of(new NewOrderLine("p1", 3, null, null)));

        assertThat(order.status()).isEqualTo(OrderStatus.PENDING_PAYMENT);
        assertThat(order.totalAmount()).isEqualByComparingTo("29.70");
        assertThat(order.totalCurrency()).isEqualTo("EUR");
        assertThat(order.lines()).hasSize(1);
    }

    @Test
    void execute_rejectsInactiveProduct() {
        final Product inactive = new Product("p2", "cat1", "PEN-002", "Old Pen", "desc", new BigDecimal("5"), "EUR", false, false);
        when(productPort.findProductById("p2")).thenReturn(Optional.of(inactive));

        assertThatThrownBy(() -> service.execute(MemberId.newId(), List.of(new NewOrderLine("p2", 1, null, null))))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void execute_rejectsUnknownProduct() {
        when(productPort.findProductById("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.execute(MemberId.newId(), List.of(new NewOrderLine("unknown", 1, null, null))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void execute_rejectsEmptyLines() {
        assertThatThrownBy(() -> service.execute(MemberId.newId(), List.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
