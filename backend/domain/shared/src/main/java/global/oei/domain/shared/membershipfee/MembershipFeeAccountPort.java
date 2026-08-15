package global.oei.domain.shared.membershipfee;

import java.util.List;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link MembershipFeePayment}.
 */
public interface MembershipFeeAccountPort {

    List<MembershipFeePayment> findByMemberId(MemberId memberId);

    MembershipFeePayment save(MembershipFeePayment payment);
}
