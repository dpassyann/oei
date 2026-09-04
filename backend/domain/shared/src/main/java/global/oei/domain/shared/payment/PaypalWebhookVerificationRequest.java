package global.oei.domain.shared.payment;

/**
 * Carries everything {@link PaypalWebhookVerificationPort} needs to ask PayPal's own
 * {@code POST /v1/notifications/verify-webhook-signature} API whether an inbound webhook
 * delivery is authentic — unlike Stripe, PayPal signature verification is not a local HMAC
 * computation, it is itself an outbound API call (see {@code PaypalWebhookVerificationAdapter}).
 *
 * <p>{@code rawEventBody} carries the exact JSON body PayPal delivered, forwarded unparsed as
 * the {@code webhook_event} field of the verification request — deliberately not a
 * {@code domain-shared} event type, since this is PayPal's own transport envelope, not an OEI
 * domain concept.</p>
 */
public record PaypalWebhookVerificationRequest(
        String authAlgo,
        String certUrl,
        String transmissionId,
        String transmissionSig,
        String transmissionTime,
        String webhookId,
        String rawEventBody) {
}
