package global.oei.domain.core.membershipfee;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membershipfee.MembershipFeeAccountPort;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.membershipfee.MembershipFeePaymentStatus;
import global.oei.domain.shared.membershipfee.MembershipFeeTier;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PayMembershipFeeServiceTest {

    private final MembershipFeeAccountPort port = mock(MembershipFeeAccountPort.class);
    private final PayMembershipFeeService service = new PayMembershipFeeService(port);

    @Test
    void execute_alwaysRecordsAPaidPayment() {
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final MembershipFeePayment payment = service.execute(MemberId.newId(), MembershipFeeTier.MEMBER, 2026, 50.0);

        assertThat(payment.status()).isEqualTo(MembershipFeePaymentStatus.PAID);
        assertThat(payment.cycleYear()).isEqualTo(2026);
        assertThat(payment.amount()).isEqualTo(50.0);
        assertThat(payment.id()).isNotBlank();
    }

    @Test
    void execute_rejectsNonPositiveAmount() {
        assertThatThrownBy(() -> service.execute(MemberId.newId(), MembershipFeeTier.STUDENT, 2026, 0))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
