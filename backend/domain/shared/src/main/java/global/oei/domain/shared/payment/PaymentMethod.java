package global.oei.domain.shared.payment;

import lombok.Getter;
import lombok.Setter;

/**
 * Payment method chosen by a member at checkout. Delegates the actual charge/refund to a
 * {@link PaymentProviderPort} bound by {@code PaymentProviderBinder} (infrastructure-client)
 * at startup — no Spring/HTTP import here, this enum stays framework-agnostic like every
 * other domain-shared type.
 */
public enum PaymentMethod {

    CARD {
        @Override
        public Payment charge(final ChargeRequest request) {
            return getProviderPort().charge(request);
        }

        @Override
        public Payment refund(final Payment payment) {
            return getProviderPort().refund(payment);
        }
    },
    PAYPAL {
        @Override
        public Payment charge(final ChargeRequest request) {
            return getProviderPort().charge(request);
        }

        @Override
        public Payment refund(final Payment payment) {
            return getProviderPort().refund(payment);
        }
    };
    // Extensible: a future SEPA/wire-transfer method is a new enum constant + a new
    // PaymentProviderPort implementation, never a change to this abstract contract.

    @Getter
    @Setter
    private PaymentProviderPort providerPort;

    public abstract Payment charge(ChargeRequest request);

    public abstract Payment refund(Payment payment);
}
