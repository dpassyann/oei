package global.oei.domain.core.membershipfee;

import java.time.Instant;
import java.util.UUID;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
@Slf4j
@RequiredArgsConstructor
public class PayMembershipFeeService implements PayMembershipFeeUseCase {

    @NonNull
    private final MembershipFeeAccountPort membershipFeeAccountPort;

    @Override
    public MembershipFeePayment execute(final MemberId memberId, final MembershipFeeTier tier, final int cycleYear, final double amount) {
        log.debug("payMembershipFee: memberId={} tier={} cycleYear={} amount={}", memberId, tier, cycleYear, amount);
        final MembershipFeePayment payment = new MembershipFeePayment(
                UUID.randomUUID().toString(), memberId, cycleYear, tier, amount, MembershipFeePaymentStatus.PAID, Instant.now());
        log.info("payMembershipFee: payment recorded memberId={} cycleYear={} status={}", memberId, cycleYear, payment.status());
        return membershipFeeAccountPort.save(payment);
    }
}
