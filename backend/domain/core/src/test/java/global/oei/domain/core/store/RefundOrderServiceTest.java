package global.oei.domain.core.store;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.payment.*;
import global.oei.domain.shared.store.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RefundOrderServiceTest {

    private final OrderPort orderPort = mock(OrderPort.class);
    private final PaymentPort paymentPort = mock(PaymentPort.class);
    private final RefundOrderService service = new RefundOrderService(orderPort, paymentPort);

    @Test
    void execute_refundsThroughTheOriginalProviderAndTransitionsOrder() {
        final MemberId memberId = MemberId.newId();
        final OrderLine line = new OrderLine("l1", "o1", "p1", 1, new BigDecimal("9.90"), null, null);
        final Order paidOrder =
                new Order("o1", memberId, List.of(line), new BigDecimal("9.90"), "EUR", OrderStatus.PENDING_FULFILLMENT, Instant.now(), Instant.now());
        final Payment succeeded = new Payment(
                "pay1", "o1", PaymentMethod.CARD, "ref-1", new BigDecimal("9.90"), "EUR", PaymentStatus.SUCCEEDED, null, Instant.now(), Instant.now());

        PaymentMethod.CARD.setProviderPort(new PaymentProviderPort() {
            @Override
            public PaymentMethod supportedPaymentMethod() {
                return PaymentMethod.CARD;
            }

            @Override
            public Payment charge(final ChargeRequest request) {
                throw new UnsupportedOperationException();
            }

            @Override
            public Payment refund(final Payment payment) {
                return payment.refund();
            }
        });

        when(orderPort.findById("o1")).thenReturn(Optional.of(paidOrder));
        when(paymentPort.findByOrderId("o1")).thenReturn(List.of(succeeded));
        when(orderPort.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final Order result = service.execute("o1");

        assertThat(result.status()).isEqualTo(OrderStatus.REFUNDED);
    }
}
