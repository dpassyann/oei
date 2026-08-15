package global.oei.infrastructure.client.paypal;

/**
 * Raised when a PayPal refund did not complete successfully. Never let this (or its message)
 * leak past {@code RefundOrderService} in a public API error contract without being mapped to
 * a stable OEI error first.
 */
public class PaypalRefundFailedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public PaypalRefundFailedException(final String providerReference) {
        super("PayPal refund did not succeed for capture " + providerReference);
    }

    public PaypalRefundFailedException(final String providerReference, final Throwable cause) {
        super("PayPal refund failed for capture " + providerReference, cause);
    }
}
