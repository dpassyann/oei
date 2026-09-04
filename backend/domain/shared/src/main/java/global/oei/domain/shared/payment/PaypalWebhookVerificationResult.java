package global.oei.domain.shared.payment;

/**
 * Outcome of asking PayPal's verify-webhook-signature API whether an inbound webhook delivery
 * is authentic. Deliberately three-valued, not a boolean: a PayPal API error/timeout must never
 * be conflated with an explicit {@code FAILURE} verdict — the caller (the webhook HTTP resource)
 * needs to tell "PayPal said no" (reject, do not retry) apart from "could not ask PayPal" (fail
 * closed, let PayPal retry), exactly like {@code StripeSignatureVerifier.Result} distinguishes
 * its own rejection reasons for Stripe.
 */
public enum PaypalWebhookVerificationResult {
    /** PayPal's API confirmed {@code verification_status: SUCCESS}. */
    SUCCESS,
    /** PayPal's API responded with {@code verification_status: FAILURE}. */
    FAILURE,
    /**
     * PayPal's verify-webhook-signature API could not be called or answered unexpectedly
     * (network error, timeout, non-2xx, malformed response). Never trust the event content in
     * this case — fail closed.
     */
    VERIFICATION_UNAVAILABLE
}
