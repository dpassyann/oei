package global.oei.domain.shared.payment;

/**
 * Outbound port for verifying an inbound PayPal webhook delivery via PayPal's own
 * {@code POST /v1/notifications/verify-webhook-signature} API. Deliberately distinct from
 * {@link PaymentProviderPort}: this port authenticates an inbound provider callback, it never
 * charges/refunds anything.
 */
public interface PaypalWebhookVerificationPort {

    PaypalWebhookVerificationResult verify(PaypalWebhookVerificationRequest request);
}
