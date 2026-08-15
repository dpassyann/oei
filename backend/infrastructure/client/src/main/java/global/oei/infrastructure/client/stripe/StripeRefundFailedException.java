package global.oei.infrastructure.client.stripe;

/**
 * Raised when a Stripe refund did not complete successfully. Never let this (or its message,
 * which may echo Stripe's own wording) leak past {@code RefundOrderService} in a public API
 * error contract without being mapped to a stable OEI error first.
 */
public class StripeRefundFailedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public StripeRefundFailedException(final String providerReference) {
        super("Stripe refund did not succeed for PaymentIntent " + providerReference);
    }

    public StripeRefundFailedException(final String providerReference, final Throwable cause) {
        super("Stripe refund failed for PaymentIntent " + providerReference, cause);
    }
}
