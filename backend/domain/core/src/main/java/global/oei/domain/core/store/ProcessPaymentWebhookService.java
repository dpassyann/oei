package global.oei.domain.core.store;

import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.payment.Payment;
import global.oei.domain.shared.payment.PaymentFailureReason;
import global.oei.domain.shared.payment.PaymentStatus;
import global.oei.domain.shared.store.PaymentPort;
import global.oei.domain.shared.store.PaymentWebhookOutcome;
import global.oei.domain.shared.store.ProcessPaymentWebhookUseCase;

/**
 * Applies a provider webhook notification (Stripe {@code payment_intent.succeeded}/
 * {@code payment_intent.payment_failed}) to the matching {@link Payment}.
 *
 * <p>Idempotency is handled here, never by weakening {@link Payment}'s own state-machine
 * guards: a {@link Payment} already in the terminal state the event reports is a deliberate
 * no-op ({@link PaymentWebhookOutcome#ALREADY_APPLIED}), so replaying the same provider event
 * (e.g. Stripe's at-least-once delivery) never throws.</p>
 *
 * <p>The read-decide-write sequence itself runs through {@link PaymentPort#lockAndApply}, not a
 * plain {@code findByProviderReference} + {@code save} pair: without a lock spanning the whole
 * sequence, two concurrent deliveries for the same provider reference could both observe
 * {@code PENDING}, both pass the idempotency check below, and both transition/save -- exactly the
 * double-apply this idempotency check exists to prevent.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class ProcessPaymentWebhookService implements ProcessPaymentWebhookUseCase {

    private final PaymentPort paymentPort;

    @Override
    public PaymentWebhookOutcome handleSucceeded(final String providerReference, final Instant succeededAt) {
        final AtomicBoolean transitioned = new AtomicBoolean(false);
        final Optional<Payment> maybePayment = paymentPort.lockAndApply(providerReference, payment -> {
            if (payment.status() != PaymentStatus.PENDING) {
                // Not PENDING any more: either this exact event was already applied (SUCCEEDED) or
                // the payment moved on since (FAILED/REFUNDED) -- either way, calling succeed()
                // again would throw (Payment's require(PENDING) guard is intentionally never
                // weakened, see its Javadoc), so this is a deliberate idempotent no-op instead.
                // Evaluated under the lock held by lockAndApply, so a concurrent duplicate
                // delivery for the same providerReference cannot also observe PENDING here.
                return payment;
            }
            transitioned.set(true);
            return payment.succeed(providerReference, succeededAt);
        });
        if (maybePayment.isEmpty()) {
            return PaymentWebhookOutcome.PAYMENT_NOT_FOUND;
        }
        if (!transitioned.get()) {
            return PaymentWebhookOutcome.ALREADY_APPLIED;
        }
        log.info("Payment {} transitioned to SUCCEEDED by provider webhook (providerReference={})", maybePayment.get().id(), providerReference);
        return PaymentWebhookOutcome.APPLIED;
    }

    @Override
    public PaymentWebhookOutcome handleFailed(final String providerReference, final PaymentFailureReason reason) {
        final AtomicBoolean transitioned = new AtomicBoolean(false);
        final Optional<Payment> maybePayment = paymentPort.lockAndApply(providerReference, payment -> {
            if (payment.status() != PaymentStatus.PENDING) {
                return payment;
            }
            transitioned.set(true);
            return payment.fail(reason);
        });
        if (maybePayment.isEmpty()) {
            return PaymentWebhookOutcome.PAYMENT_NOT_FOUND;
        }
        if (!transitioned.get()) {
            return PaymentWebhookOutcome.ALREADY_APPLIED;
        }
        log.info("Payment {} transitioned to FAILED by provider webhook (providerReference={})", maybePayment.get().id(), providerReference);
        return PaymentWebhookOutcome.APPLIED;
    }
}
