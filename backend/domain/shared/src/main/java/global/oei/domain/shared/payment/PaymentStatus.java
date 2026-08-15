package global.oei.domain.shared.payment;

/**
 * Lifecycle of a {@link Payment}. Simple enum, no polymorphic behavior (unlike
 * {@link PaymentMethod}, which is a genuine enum strategy) — transitions are expressed as
 * methods on {@link Payment} itself.
 *
 * <pre>
 * PENDING -&gt; SUCCEEDED
 *         -&gt; FAILED
 * SUCCEEDED -&gt; REFUNDED
 * </pre>
 */
public enum PaymentStatus {
    PENDING,
    SUCCEEDED,
    FAILED,
    REFUNDED
}
