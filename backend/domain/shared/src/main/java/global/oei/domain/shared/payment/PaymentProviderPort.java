package global.oei.domain.shared.payment;

/**
 * Outbound port — one implementation per {@link PaymentMethod} (Stripe for CARD, PayPal for
 * PAYPAL), bound at startup by {@code PaymentProviderBinder} in infrastructure-client.
 */
@FunctionalInterface
public interface PaymentProviderPort {

    /**
     * Declares the {@link PaymentMethod} handled by this port. Implementations must override
     * this explicitly — the default fails fast to make a missing declaration obvious at
     * startup binding time.
     */
    default PaymentMethod supportedPaymentMethod() {
        throw new UnsupportedOperationException("PaymentProviderPort must declare supportedPaymentMethod()");
    }

    Payment charge(ChargeRequest request);

    default Payment refund(final Payment payment) {
        throw new UnsupportedOperationException(supportedPaymentMethod() + " does not support refund()");
    }
}
