package global.oei.domain.shared.payment;

/**
 * Stable, OEI-owned vocabulary for payment failures — never the raw exception name or the
 * provider-specific error code of Stripe/PayPal, which must never leak past the
 * infrastructure-client adapter that talks to that provider.
 */
public enum PaymentFailureReason {
    /** The card (or PayPal funding source) was explicitly declined by the provider. */
    CARD_DECLINED,
    /** The provider could not be reached in time (network/timeout, not a business refusal). */
    PROVIDER_TIMEOUT,
    /** The payer explicitly cancelled the payment flow (e.g. PayPal redirect cancellation). */
    USER_CANCELLED,
    /** Any other provider failure that does not map to a more specific reason above. */
    UNKNOWN
}
