package global.oei.infrastructure.client.payment;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.InitializingBean;

import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.payment.PaymentProviderPort;

/**
 * Binds each {@link PaymentProviderPort} to its {@link PaymentMethod} at startup.
 */
@Slf4j
public class PaymentProviderBinder implements InitializingBean {

    private final Map<PaymentMethod, PaymentProviderPort> portsByMethod;

    public PaymentProviderBinder(final List<PaymentProviderPort> ports) {
        portsByMethod = new EnumMap<>(PaymentMethod.class);
        ports.forEach(port -> portsByMethod.put(port.supportedPaymentMethod(), port));
    }

    @Override
    public void afterPropertiesSet() {
        portsByMethod.forEach(PaymentMethod::setProviderPort);
        log.info("PaymentProvider ports bound: {}/{}", portsByMethod.size(), PaymentMethod.values().length);

        for (final PaymentMethod method : PaymentMethod.values()) {
            if (!portsByMethod.containsKey(method)) {
                log.error("No PaymentProviderPort registered for PaymentMethod.{}", method);
            }
        }
    }
}
