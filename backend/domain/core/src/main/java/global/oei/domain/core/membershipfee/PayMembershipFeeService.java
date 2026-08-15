package global.oei.domain.core.membershipfee;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membershipfee.MembershipFeeAccountPort;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.membershipfee.MembershipFeePaymentStatus;
import global.oei.domain.shared.membershipfee.MembershipFeeTier;
import global.oei.domain.shared.membershipfee.PayMembershipFeeUseCase;

/**
 * Records a membership fee payment. Mocked — no real payment processor is called in this
 * iteration (same posture as {@code CreateWalletPassService}/{@code WalletPass}): every
 * payment this service records is unconditionally {@link MembershipFeePaymentStatus#PAID},
 * since there is no gateway integration yet that could ever produce
 * {@link MembershipFeePaymentStatus#FAILED} in practice.
 */
public class PayMembershipFeeService implements PayMembershipFeeUseCase {

    private final MembershipFeeAccountPort membershipFeeAccountPort;

    public PayMembershipFeeService(final MembershipFeeAccountPort membershipFeeAccountPort) {
        this.membershipFeeAccountPort = Objects.requireNonNull(membershipFeeAccountPort, "membershipFeeAccountPort must not be null");
    }

    @Override
    public MembershipFeePayment execute(final MemberId memberId, final MembershipFeeTier tier, final int cycleYear, final double amount) {
        final MembershipFeePayment payment = new MembershipFeePayment(
                UUID.randomUUID().toString(), memberId, cycleYear, tier, amount, MembershipFeePaymentStatus.PAID, Instant.now());
        return membershipFeeAccountPort.save(payment);
    }
}
