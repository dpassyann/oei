package global.oei.domain.shared.store;

import java.time.Instant;

import global.oei.domain.shared.payment.PaymentFailureReason;

/**
 * Inbound port for applying a payment provider's (Stripe/PayPal) asynchronous webhook
 * notification to the matching {@link Payment}. Deliberately separate from
 * {@link PayOrderUseCase}: that use case drives a synchronous checkout charge, this one reacts
 * to an out-of-band provider callback for a {@link Payment} that already exists.
 *
 * <p>Both operations are idempotent by contract: replaying the same event (or receiving it for
 * a {@link Payment} that already reached the reported terminal state) must never throw and must
 * never double-apply a transition — see {@link PaymentWebhookOutcome#ALREADY_APPLIED}.</p>
 */
public interface ProcessPaymentWebhookUseCase {

    /**
     * Applies a successful charge notification to the {@link Payment} identified by
     * {@code providerReference}.
     */
    PaymentWebhookOutcome handleSucceeded(String providerReference, Instant succeededAt);

    /**
     * Applies a failed charge notification to the {@link Payment} identified by
     * {@code providerReference}.
     */
    PaymentWebhookOutcome handleFailed(String providerReference, PaymentFailureReason reason);
}
