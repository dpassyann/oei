package global.oei.domain.core.store;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.store.CreateOrderUseCase;
import global.oei.domain.shared.store.NewOrderLine;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderLine;
import global.oei.domain.shared.store.OrderPort;
import global.oei.domain.shared.store.OrderStatus;
import global.oei.domain.shared.store.Product;
import global.oei.domain.shared.store.ProductPort;

/**
 * Creates a new {@link Order} at {@link OrderStatus#PENDING_PAYMENT}. Every line's price is
 * resolved from the current, active catalog {@link Product} — the client-declared quantity is
 * trusted, its price never is (see the OpenAPI contract summary and {@code 02-paiement.md §1}).
 */
@Slf4j
@RequiredArgsConstructor
public class CreateOrderService implements CreateOrderUseCase {

    @NonNull
    private final ProductPort productPort;
    @NonNull
    private final OrderPort orderPort;

    @Override
    public Order execute(final MemberId memberId, final List<NewOrderLine> newLines) {
        log.debug("createOrder: start memberId={} lines={}", memberId, newLines == null ? null : newLines.size());
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(newLines, "newLines must not be null");
        if (newLines.isEmpty()) {
            throw new IllegalArgumentException("an order must have at least one line");
        }

        final String orderId = UUID.randomUUID().toString();
        final List<OrderLine> lines = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        String currency = null;
        for (final NewOrderLine newLine : newLines) {
            final Product product = productPort.findProductById(newLine.productId())
                    .orElseThrow(() -> new IllegalArgumentException("unknown product " + newLine.productId()));
            if (!product.active()) {
                throw new IllegalStateException("product " + product.id() + " is not active");
            }
            currency = product.unitPriceCurrency();
            final OrderLine line = new OrderLine(
                    UUID.randomUUID().toString(), orderId, product.id(), newLine.quantity(),
                    product.unitPriceAmount(), newLine.businessCardCustomization(), newLine.sourceReferenceId());
            total = total.add(line.lineTotal());
            lines.add(line);
        }

        final Order order = new Order(orderId, memberId, lines, total, currency, OrderStatus.PENDING_PAYMENT, Instant.now(), null);
        log.info("createOrder: order built orderId={} memberId={} total={} currency={}", orderId, memberId, total, currency);
        return orderPort.save(order);
    }
}
