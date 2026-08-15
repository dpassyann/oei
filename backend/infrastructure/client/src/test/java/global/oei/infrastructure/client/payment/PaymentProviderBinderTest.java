package global.oei.infrastructure.client.payment;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.payment.ChargeRequest;
import global.oei.domain.shared.payment.Payment;
import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.payment.PaymentProviderPort;

/**
 * Verifies the {@link PaymentProviderBinder} binds every {@link PaymentMethod} to the
 * {@link PaymentProviderPort} that declares it via {@link PaymentProviderPort#supportedPaymentMethod()}.
 */
class PaymentProviderBinderTest {

    @Test
    void bindsEveryPaymentMethodToItsDeclaredPort() {
        final PaymentProviderPort cardPort = fakePort(PaymentMethod.CARD);
        final PaymentProviderPort paypalPort = fakePort(PaymentMethod.PAYPAL);

        new PaymentProviderBinder(List.of(cardPort, paypalPort)).afterPropertiesSet();

        assertThat(PaymentMethod.CARD.getProviderPort()).isSameAs(cardPort);
        assertThat(PaymentMethod.PAYPAL.getProviderPort()).isSameAs(paypalPort);
    }

    @Test
    void logsButDoesNotThrowWhenAMethodHasNoPort() {
        final PaymentProviderPort cardPort = fakePort(PaymentMethod.CARD);

        new PaymentProviderBinder(List.of(cardPort)).afterPropertiesSet();

        assertThat(PaymentMethod.CARD.getProviderPort()).isSameAs(cardPort);
    }

    private PaymentProviderPort fakePort(final PaymentMethod method) {
        return new PaymentProviderPort() {
            @Override
            public PaymentMethod supportedPaymentMethod() {
                return method;
            }

            @Override
            public Payment charge(final ChargeRequest request) {
                throw new UnsupportedOperationException("not used by this test");
            }
        };
    }
}
