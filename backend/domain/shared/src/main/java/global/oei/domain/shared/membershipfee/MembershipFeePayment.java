package global.oei.domain.shared.membershipfee;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A single annual membership fee payment. Recorded by {@code PayMembershipFeeService}, which
 * is the sole place allowed to construct one — see its Javadoc for the "mocked, no real
 * payment processor" posture (same posture as {@code WalletPass}).
 */
public record MembershipFeePayment(
        String id,
        MemberId memberId,
        int cycleYear,
        MembershipFeeTier tier,
        double amount,
        MembershipFeePaymentStatus status,
        Instant paidAt) {

    public MembershipFeePayment {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(tier, "tier must not be null");
        Objects.requireNonNull(status, "status must not be null");
        Objects.requireNonNull(paidAt, "paidAt must not be null");
        if (amount <= 0) {
            throw new IllegalArgumentException("amount must be positive");
        }
    }
}
