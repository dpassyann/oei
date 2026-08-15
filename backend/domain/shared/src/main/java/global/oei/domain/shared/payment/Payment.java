package global.oei.domain.shared.payment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A single charge attempt for an {@code Order}. A retried payment after a failure is a brand
 * new {@link Payment} attached to the same order (the order keeps the full attempt history) —
 * never a mutation of a previously failed attempt.
 *
 * <p>{@code providerReference} is the external Stripe/PayPal identifier (PaymentIntent id,
 * PayPal order/capture id) kept for reconciliation and support; {@code paymentMethod} is the
 * method/provider that actually processed this attempt, which is what a later refund must be
 * routed back through (a Stripe payment can never be refunded via PayPal or vice-versa).</p>
 */
public record Payment(
        String id,
        String orderId,
        PaymentMethod paymentMethod,
        String providerReference,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        PaymentFailureReason failureReason,
        Instant createdAt,
        Instant succeededAt) {

    public Payment {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(orderId, "orderId must not be null");
        Objects.requireNonNull(paymentMethod, "paymentMethod must not be null");
        Objects.requireNonNull(amount, "amount must not be null");
        Objects.requireNonNull(currency, "currency must not be null");
        Objects.requireNonNull(status, "status must not be null");
        Objects.requireNonNull(createdAt, "createdAt must not be null");
    }

    /**
     * @return a copy transitioned to {@link PaymentStatus#SUCCEEDED}, stamped with
     *         {@code succeededAt}; requires {@link PaymentStatus#PENDING}
     */
    public Payment succeed(final String resolvedProviderReference, final Instant succeededAtInstant) {
        require(PaymentStatus.PENDING);
        return new Payment(id, orderId, paymentMethod, resolvedProviderReference, amount, currency,
                PaymentStatus.SUCCEEDED, null, createdAt, succeededAtInstant);
    }

    /**
     * @return a copy transitioned to {@link PaymentStatus#FAILED}; requires
     *         {@link PaymentStatus#PENDING}
     */
    public Payment fail(final PaymentFailureReason reason) {
        require(PaymentStatus.PENDING);
        Objects.requireNonNull(reason, "reason must not be null");
        return new Payment(id, orderId, paymentMethod, providerReference, amount, currency,
                PaymentStatus.FAILED, reason, createdAt, null);
    }

    /**
     * @return a copy transitioned to {@link PaymentStatus#REFUNDED}; requires
     *         {@link PaymentStatus#SUCCEEDED}
     */
    public Payment refund() {
        require(PaymentStatus.SUCCEEDED);
        return new Payment(id, orderId, paymentMethod, providerReference, amount, currency,
                PaymentStatus.REFUNDED, failureReason, createdAt, succeededAt);
    }

    private void require(final PaymentStatus expected) {
        if (status != expected) {
            throw new IllegalStateException("expected status " + expected + " but was " + status);
        }
    }
}
