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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Resolves the {@link PaymentMethod} chosen at checkout, charges it, and transitions the
 * {@link Order} accordingly. On success, immediately marks the order
 * {@link global.oei.domain.shared.store.OrderStatus#PENDING_FULFILLMENT} (mocked, see
 * {@link Order}'s Javadoc) and triggers the order confirmation email — never before, never on
 * failure. The email send itself must never block/fail this transaction: the
 * {@link EmailNotificationPort} implementation is responsible for its own async dispatch (see
 * {@code 03-emails-transactionnels.md §3}), this service only calls it.
 */
@Slf4j
@RequiredArgsConstructor
public class PayOrderService implements PayOrderUseCase {

    @NonNull
    private final OrderPort orderPort;
    @NonNull
    private final PaymentPort paymentPort;
    @NonNull
    private final MemberPort memberPort;
    @NonNull
    private final EmailNotificationPort emailNotificationPort;

    @Override
    public Order execute(final String orderId, final MemberId memberId, final PaymentMethod paymentMethod, final String paymentToken) {
        log.debug("payOrder: start orderId={} memberId={} method={}", orderId, memberId, paymentMethod);
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
            log.info("payOrder: payment failed orderId={} status={}", order.id(), result.status());
            return orderPort.save(order.failPayment());
        }

        final Order paidOrder = orderPort.save(order.pay(Instant.now()).markFulfillmentPending());
        final Member member = memberPort.findById(order.memberId()).orElse(null);
        if (member != null) {
            emailNotificationPort.sendOrderConfirmation(paidOrder, member);
        }
        log.info("payOrder: payment succeeded orderId={} paymentStatus={}", paidOrder.id(), result.status());
        return paidOrder;
    }
}
