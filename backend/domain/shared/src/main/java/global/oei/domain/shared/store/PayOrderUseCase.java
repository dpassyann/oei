package global.oei.domain.shared.store;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.payment.PaymentMethod;

/**
 * Initiates/confirms payment of an {@link Order} through the {@link PaymentMethod} chosen by
 * the member, transitions the order accordingly, and (on success) triggers the order
 * confirmation email.
 */
public interface PayOrderUseCase {

    Order execute(String orderId, MemberId memberId, PaymentMethod paymentMethod, String paymentToken);
}
