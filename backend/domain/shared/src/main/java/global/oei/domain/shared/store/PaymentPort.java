package global.oei.domain.shared.store;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.payment.Payment;

/**
 * Outbound port for {@link Payment} persistence. Deliberately distinct from
 * {@link global.oei.domain.shared.payment.PaymentProviderPort}: this port persists the OEI
 * record of a charge attempt, the other one actually talks to Stripe/PayPal.
 */
public interface PaymentPort {

    Payment save(Payment payment);

    Optional<Payment> findById(String id);

    List<Payment> findByOrderId(String orderId);
}
