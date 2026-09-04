package global.oei.domain.shared.store;

import java.util.List;
import java.util.Optional;
import java.util.function.UnaryOperator;

import global.oei.domain.shared.payment.Payment;

/**
 * Outbound port for {@link Payment} persistence. Deliberately distinct from
 * {@link global.oei.domain.shared.payment.PaymentProviderPort}: this port persists the OEI
 * record of a charge attempt, the other one actually talks to Stripe/PayPal.
 */
public interface PaymentPort {

    Payment save(Payment payment);

    Optional<Payment> findById(String id);

    List<Payment> findByOrderId(String orderId);

    /**
     * Looks up the {@link Payment} attempt by the external provider identifier (Stripe
     * PaymentIntent id, PayPal order/capture id).
     *
     * <p><b>Not safe for read-decide-write sequences</b> (e.g. "if PENDING then transition"):
     * the read here is not held under any lock, so two concurrent callers can both observe the
     * same pre-transition state before either writes back. Use {@link #lockAndApply} for that.</p>
     */
    Optional<Payment> findByProviderReference(String providerReference);

    /**
     * Atomically applies {@code transition} to the {@link Payment} matching
     * {@code providerReference}, holding an exclusive lock on that row for the whole
     * read-decide-write sequence, and persists whatever {@code transition} returns.
     *
     * <p>Exists specifically to close the TOCTOU window inherent to
     * {@link #findByProviderReference} + {@link #save}: without this, two concurrent webhook
     * deliveries for the same provider reference (e.g. Stripe's at-least-once retry racing a
     * duplicate delivery) could both read the payment while it is still {@code PENDING}, both
     * pass an idempotency check, and both apply a transition before either write lands --
     * double-applying a side effect the idempotency check was meant to prevent. {@code
     * transition} is expected to itself be idempotent (return its input unchanged when no
     * transition should occur), matching {@link Payment}'s state-machine guards which are never
     * weakened.</p>
     *
     * @return the transitioned (or unchanged, if {@code transition} was a no-op) {@link Payment},
     *         or {@link Optional#empty()} if no payment matches {@code providerReference}.
     */
    Optional<Payment> lockAndApply(String providerReference, UnaryOperator<Payment> transition);
}
