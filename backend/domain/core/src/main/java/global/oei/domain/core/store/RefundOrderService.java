package global.oei.domain.core.store;

import java.util.List;
import java.util.Objects;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
@Slf4j
@RequiredArgsConstructor
public class RefundOrderService implements RefundOrderUseCase {

    @NonNull
    private final OrderPort orderPort;
    @NonNull
    private final PaymentPort paymentPort;

    @Override
    public Order execute(final String orderId) {
        log.debug("refundOrder: start orderId={}", orderId);
        Objects.requireNonNull(orderId, "orderId must not be null");
        final Order order = orderPort.findById(orderId).orElseThrow(() -> new IllegalArgumentException("unknown order " + orderId));

        final List<Payment> payments = paymentPort.findByOrderId(orderId);
        final Payment succeeded = payments.stream()
                .filter(payment -> payment.status() == PaymentStatus.SUCCEEDED)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("no succeeded payment found for order " + orderId));

        final Payment refunded = succeeded.paymentMethod().refund(succeeded);
        paymentPort.save(refunded);

        log.info("refundOrder: refunded orderId={} paymentId={}", orderId, refunded.id());
        return orderPort.save(order.refund());
    }
}
