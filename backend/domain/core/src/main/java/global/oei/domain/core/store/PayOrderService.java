package global.oei.domain.core.store;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.mail.EmailNotificationPort;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.MemberPort;
import global.oei.domain.shared.payment.ChargeRequest;
import global.oei.domain.shared.payment.Payment;
import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.payment.PaymentStatus;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderPort;
import global.oei.domain.shared.store.PayOrderUseCase;
import global.oei.domain.shared.store.PaymentPort;

/**
 * Resolves the {@link PaymentMethod} chosen at checkout, charges it, and transitions the
 * {@link Order} accordingly. On success, immediately marks the order
 * {@link global.oei.domain.shared.store.OrderStatus#PENDING_FULFILLMENT} (mocked, see
 * {@link Order}'s Javadoc) and triggers the order confirmation email — never before, never on
 * failure. The email send itself must never block/fail this transaction: the
 * {@link EmailNotificationPort} implementation is responsible for its own async dispatch (see
 * {@code 03-emails-transactionnels.md §3}), this service only calls it.
 */
public class PayOrderService implements PayOrderUseCase {

    private final OrderPort orderPort;
    private final PaymentPort paymentPort;
    private final MemberPort memberPort;
    private final EmailNotificationPort emailNotificationPort;

    public PayOrderService(
            final OrderPort orderPort, final PaymentPort paymentPort, final MemberPort memberPort, final EmailNotificationPort emailNotificationPort) {
        this.orderPort = Objects.requireNonNull(orderPort, "orderPort must not be null");
        this.paymentPort = Objects.requireNonNull(paymentPort, "paymentPort must not be null");
        this.memberPort = Objects.requireNonNull(memberPort, "memberPort must not be null");
        this.emailNotificationPort = Objects.requireNonNull(emailNotificationPort, "emailNotificationPort must not be null");
    }

    @Override
    public Order execute(final String orderId, final MemberId memberId, final PaymentMethod paymentMethod, final String paymentToken) {
        Objects.requireNonNull(orderId, "orderId must not be null");
        Objects.requireNonNull(paymentMethod, "paymentMethod must not be null");
        Objects.requireNonNull(paymentToken, "paymentToken must not be null");

        final Order order = orderPort.findById(orderId).orElseThrow(() -> new IllegalArgumentException("unknown order " + orderId));

        final ChargeRequest chargeRequest = new ChargeRequest(order.id(), memberId, order.totalAmount(), order.totalCurrency(), paymentToken);
        final Payment attempt = new Payment(
                UUID.randomUUID().toString(), order.id(), paymentMethod, null, order.totalAmount(), order.totalCurrency(),
                PaymentStatus.PENDING, null, Instant.now(), null);
        paymentPort.save(attempt);

        final Payment result = paymentMethod.charge(chargeRequest);
        paymentPort.save(result);

        if (result.status() != PaymentStatus.SUCCEEDED) {
            return orderPort.save(order.failPayment());
        }

        final Order paidOrder = orderPort.save(order.pay(Instant.now()).markFulfillmentPending());
        final Member member = memberPort.findById(order.memberId()).orElse(null);
        if (member != null) {
            emailNotificationPort.sendOrderConfirmation(paidOrder, member);
        }
        return paidOrder;
    }
}
