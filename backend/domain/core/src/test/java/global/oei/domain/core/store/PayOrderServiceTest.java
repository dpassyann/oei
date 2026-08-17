package global.oei.domain.core.store;

import global.oei.domain.shared.mail.EmailNotificationPort;
import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.MemberPort;
import global.oei.domain.shared.payment.*;
import global.oei.domain.shared.store.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PayOrderServiceTest {

    private final OrderPort orderPort = mock(OrderPort.class);
    private final PaymentPort paymentPort = mock(PaymentPort.class);
    private final MemberPort memberPort = mock(MemberPort.class);
    private final EmailNotificationPort emailNotificationPort = mock(EmailNotificationPort.class);
    private final PayOrderService service = new PayOrderService(orderPort, paymentPort, memberPort, emailNotificationPort);

    private final MemberId memberId = MemberId.newId();
    private final OrderLine line = new OrderLine("l1", "o1", "p1", 1, new BigDecimal("9.90"), null, null);
    private final Order pendingOrder =
            new Order("o1", memberId, List.of(line), new BigDecimal("9.90"), "EUR", OrderStatus.PENDING_PAYMENT, Instant.now(), null);

    @Test
    void execute_onSuccessfulCharge_marksOrderPendingFulfillmentAndSendsEmail() {
        final PaymentProviderPort fakePort = fakeProviderPort(true);
        PaymentMethod.CARD.setProviderPort(fakePort);
        when(orderPort.findById("o1")).thenReturn(Optional.of(pendingOrder));
        when(orderPort.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        final Member member = new Member(memberId, "jane-doe", "Jane Doe", "Jane Doe", "fr", "FR", AccountType.REAL, Instant.now());
        when(memberPort.findById(memberId)).thenReturn(Optional.of(member));

        final Order result = service.execute("o1", memberId, PaymentMethod.CARD, "tok_test");

        assertThat(result.status()).isEqualTo(OrderStatus.PENDING_FULFILLMENT);
        verify(emailNotificationPort).sendOrderConfirmation(any(), any());
    }

    @Test
    void execute_onFailedCharge_marksOrderPaymentFailedAndNeverSendsEmail() {
        final PaymentProviderPort fakePort = fakeProviderPort(false);
        PaymentMethod.CARD.setProviderPort(fakePort);
        when(orderPort.findById("o1")).thenReturn(Optional.of(pendingOrder));
        when(orderPort.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final Order result = service.execute("o1", memberId, PaymentMethod.CARD, "tok_test");

        assertThat(result.status()).isEqualTo(OrderStatus.PAYMENT_FAILED);
        verify(emailNotificationPort, never()).sendOrderConfirmation(any(), any());
    }

    private PaymentProviderPort fakeProviderPort(final boolean succeeds) {
        return new PaymentProviderPort() {
            @Override
            public PaymentMethod supportedPaymentMethod() {
                return PaymentMethod.CARD;
            }

            @Override
            public Payment charge(final ChargeRequest request) {
                final Payment pending = new Payment(
                        "pay1", request.orderId(), PaymentMethod.CARD, null, request.amount(), request.currency(),
                        PaymentStatus.PENDING, null, Instant.now(), null);
                return succeeds ? pending.succeed("ref-1", Instant.now()) : pending.fail(PaymentFailureReason.CARD_DECLINED);
            }
        };
    }
}
