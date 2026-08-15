package global.oei.domain.shared.membershipfee;

import java.util.List;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A member's membership fee account: the {@link MembershipFeeTier} they currently pay at (the
 * tier of their most recent payment, or {@link MembershipFeeTier#MEMBER} by default before any
 * payment has ever been recorded) and their full payment history.
 *
 * <p>Deliberately carries no reasoning about the current billing cycle ("is this year's fee
 * already paid, is the account overdue") — that pure calculation is performed by the caller
 * (client mock today, a future server-side prorata function later), exactly as documented on
 * the {@code getMyMembershipFeeAccount} operation.</p>
 */
public record MembershipFeeAccount(MemberId memberId, MembershipFeeTier tier, List<MembershipFeePayment> payments) {

    public MembershipFeeAccount {
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(tier, "tier must not be null");
        Objects.requireNonNull(payments, "payments must not be null");
        payments = List.copyOf(payments);
    }
}
