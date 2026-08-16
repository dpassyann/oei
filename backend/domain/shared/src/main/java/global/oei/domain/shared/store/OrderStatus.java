package global.oei.domain.shared.store;

/**
 * Lifecycle of an {@link Order}.
 *
 * <pre>
 * PENDING_PAYMENT -&gt; PAID -&gt; PENDING_FULFILLMENT
 *                 \-&gt; PAYMENT_FAILED
 * PENDING_PAYMENT/PAID -&gt; CANCELLED
 * PAID/PENDING_FULFILLMENT -&gt; REFUNDED
 * </pre>
 *
 * <p>{@code PAID} and {@code PENDING_FULFILLMENT} are deliberately kept as two distinct
 * statuses even though V1 always transitions from one to the other immediately and
 * automatically: this honestly documents that "paid" and "queued for a (mocked) physical
 * fulfillment step" are two different facts, and leaves room for a V2 real fulfillment
 * provider to introduce an actual delay between them without a status rename. See
 * {@link Order}'s Javadoc for the fulfillment-mocking posture itself.</p>
 */
public enum OrderStatus {
    PENDING_PAYMENT,
    PAID,
    PENDING_FULFILLMENT,
    PAYMENT_FAILED,
    CANCELLED,
    REFUNDED
}
