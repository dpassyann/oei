package global.oei.domain.shared.membershipfee;

import global.oei.domain.shared.member.MemberId;

/**
 * Records the (mocked) payment of a member's annual membership fee.
 */
public interface PayMembershipFeeUseCase {

    MembershipFeePayment execute(MemberId memberId, MembershipFeeTier tier, int cycleYear, double amount);
}
