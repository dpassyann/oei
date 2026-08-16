package global.oei.domain.core.store;

import java.util.List;
import java.util.Objects;

import global.oei.domain.shared.payment.Payment;
import global.oei.domain.shared.payment.PaymentStatus;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderPort;
import global.oei.domain.shared.store.PaymentPort;
import global.oei.domain.shared.store.RefundOrderUseCase;

/**
 * Admin-only action: resolves the {@link global.oei.domain.shared.payment.PaymentMethod} that
 * originally succeeded for this order and asks it to refund the payment (a Stripe payment can
 * never be refunded through PayPal or vice-versa). Full refund only in V1, no partial refund
 * (see {@code 02-paiement.md §3}).
 */
public class RefundOrderService implements RefundOrderUseCase {

    private final OrderPort orderPort;
    private final PaymentPort paymentPort;

    public RefundOrderService(final OrderPort orderPort, final PaymentPort paymentPort) {
        this.orderPort = Objects.requireNonNull(orderPort, "orderPort must not be null");
        this.paymentPort = Objects.requireNonNull(paymentPort, "paymentPort must not be null");
    }

    @Override
    public Order execute(final String orderId) {
        Objects.requireNonNull(orderId, "orderId must not be null");
        final Order order = orderPort.findById(orderId).orElseThrow(() -> new IllegalArgumentException("unknown order " + orderId));

        final List<Payment> payments = paymentPort.findByOrderId(orderId);
        final Payment succeeded = payments.stream()
                .filter(payment -> payment.status() == PaymentStatus.SUCCEEDED)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("no succeeded payment found for order " + orderId));

        final Payment refunded = succeeded.paymentMethod().refund(succeeded);
        paymentPort.save(refunded);

        return orderPort.save(order.refund());
    }
}
