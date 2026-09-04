package global.oei.domain.shared.store;

/**
 * Result of applying an inbound payment provider webhook event (e.g. Stripe
 * {@code payment_intent.succeeded}/{@code payment_intent.payment_failed}) via
 * {@link ProcessPaymentWebhookUseCase}. The primary adapter (the webhook HTTP resource) uses
 * this to decide its HTTP response/log level — it never inspects {@link Payment} internals
 * itself.
 */
public enum PaymentWebhookOutcome {

    /** The matching {@link Payment} was {@code PENDING} and the transition was applied. */
    APPLIED,

    /**
     * The matching {@link Payment} was already in the terminal state the event reports
     * (replayed webhook delivery, e.g. Stripe's at-least-once retries) — a deliberate no-op,
     * never a thrown exception.
     */
    ALREADY_APPLIED,

    /**
     * No {@link Payment} matches the provider reference carried by the event. Deliberately not
     * an error: the caller still acknowledges the webhook (HTTP 200) so the provider does not
     * retry indefinitely for an event this system does not act on.
     */
    PAYMENT_NOT_FOUND
}
