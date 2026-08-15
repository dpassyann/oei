package global.oei.application.web.resource.membershipfee.adapter;

import global.oei.domain.shared.membershipfee.MembershipFeeAccount;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.membershipfee.MembershipFeeTier;

public interface MembershipFeeAdapter {

    MembershipFeeAccount getMyAccount();

    MembershipFeePayment pay(MembershipFeeTier tier, int cycleYear, double amount);
}
