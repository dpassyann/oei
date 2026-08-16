package global.oei.domain.shared.store;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * Aggregate root of a store purchase. Total amount is always computed server-side by
 * {@code CreateOrderService} from the current active catalog prices — never trusted from the
 * client. See {@link OrderStatus} for the full state machine, guarded here with the same
 * {@code require}/{@code requireOneOf} style as {@code Content}.
 *
 * <p><b>Fulfillment is explicitly mocked in V1</b> for every product category (goodies,
 * business card, print-cv, print-whitepaper): {@link #markFulfillmentPending()} never triggers
 * a real call to a printer/courier. An order that reaches {@link OrderStatus#PENDING_FULFILLMENT}
 * simply stays there — no simulated shipping event, no fake delivery date is ever produced.
 * This mirrors {@code WalletPass.mocked()} and the CV PDF rendering posture elsewhere in this
 * backend, and must never be silently "completed" by a future shortcut.</p>
 */
public record Order(
        String id,
        MemberId memberId,
        List<OrderLine> lines,
        BigDecimal totalAmount,
        String totalCurrency,
        OrderStatus status,
        Instant createdAt,
        Instant paidAt) {

    public Order {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(totalAmount, "totalAmount must not be null");
        Objects.requireNonNull(totalCurrency, "totalCurrency must not be null");
        Objects.requireNonNull(status, "status must not be null");
        Objects.requireNonNull(createdAt, "createdAt must not be null");
        lines = List.copyOf(lines == null ? List.of() : lines);
        if (lines.isEmpty()) {
            throw new IllegalArgumentException("an order must have at least one line");
        }
    }

    /**
     * @return a new instance moved to {@link OrderStatus#PAID}, stamped with {@code paidAtInstant};
     *         requires {@link OrderStatus#PENDING_PAYMENT}
     */
    public Order pay(final Instant paidAtInstant) {
        require(OrderStatus.PENDING_PAYMENT);
        Objects.requireNonNull(paidAtInstant, "paidAtInstant must not be null");
        return new Order(id, memberId, lines, totalAmount, totalCurrency, OrderStatus.PAID, createdAt, paidAtInstant);
    }

    /**
     * @return a new instance moved to {@link OrderStatus#PAYMENT_FAILED}; requires
     *         {@link OrderStatus#PENDING_PAYMENT}
     */
    public Order failPayment() {
        require(OrderStatus.PENDING_PAYMENT);
        return withStatus(OrderStatus.PAYMENT_FAILED);
    }

    /**
     * @return a new instance moved to {@link OrderStatus#PENDING_FULFILLMENT} (mocked, see
     *         class Javadoc); requires {@link OrderStatus#PAID}
     */
    public Order markFulfillmentPending() {
        require(OrderStatus.PAID);
        return withStatus(OrderStatus.PENDING_FULFILLMENT);
    }

    /**
     * @return a new instance moved to {@link OrderStatus#CANCELLED}; requires
     *         {@link OrderStatus#PENDING_PAYMENT} or {@link OrderStatus#PAID}
     */
    public Order cancel() {
        requireOneOf(OrderStatus.PENDING_PAYMENT, OrderStatus.PAID);
        return withStatus(OrderStatus.CANCELLED);
    }

    /**
     * @return a new instance moved to {@link OrderStatus#REFUNDED}; requires
     *         {@link OrderStatus#PAID} or {@link OrderStatus#PENDING_FULFILLMENT}
     */
    public Order refund() {
        requireOneOf(OrderStatus.PAID, OrderStatus.PENDING_FULFILLMENT);
        return withStatus(OrderStatus.REFUNDED);
    }

    private Order withStatus(final OrderStatus newStatus) {
        return new Order(id, memberId, lines, totalAmount, totalCurrency, newStatus, createdAt, paidAt);
    }

    private void require(final OrderStatus expected) {
        if (status != expected) {
            throw new IllegalStateException("expected status " + expected + " but was " + status);
        }
    }

    private void requireOneOf(final OrderStatus... allowed) {
        for (final OrderStatus candidate : allowed) {
            if (status == candidate) {
                return;
            }
        }
        throw new IllegalStateException("status " + status + " not in allowed set");
    }
}
