package global.oei.application.web.resource.membershipfee.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.application.web.resource.membershipfee.adapter.MembershipFeeAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membershipfee.MembershipFeeAccount;
import global.oei.domain.shared.membershipfee.MembershipFeeAccountPort;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.membershipfee.MembershipFeeTier;
import global.oei.domain.shared.membershipfee.PayMembershipFeeUseCase;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipFeeService implements MembershipFeeAdapter {

    private static final MembershipFeeTier DEFAULT_TIER = MembershipFeeTier.MEMBER;

    private final SecurityContextPort securityContextPort;
    private final MembershipFeeAccountPort membershipFeeAccountPort;
    private final PayMembershipFeeUseCase payMembershipFeeUseCase;

    @Override
    public MembershipFeeAccount getMyAccount() {
        final MemberId memberId = currentMemberId();
        final List<MembershipFeePayment> payments = membershipFeeAccountPort.findByMemberId(memberId);
        final MembershipFeeTier tier = payments.stream()
                .max(Comparator.comparingInt(MembershipFeePayment::cycleYear))
                .map(MembershipFeePayment::tier)
                .orElse(DEFAULT_TIER);
        return new MembershipFeeAccount(memberId, tier, payments);
    }

    @Override
    public MembershipFeePayment pay(final MembershipFeeTier tier, final int cycleYear, final double amount) {
        return payMembershipFeeUseCase.execute(currentMemberId(), tier, cycleYear, amount);
    }

    private MemberId currentMemberId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return MemberId.of(identity.subject());
    }
}
