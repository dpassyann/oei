package global.oei.application.web.resource.member.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.member.adapter.AdminMembersAdapter;
import global.oei.domain.shared.badge.AwardBadgeUseCase;
import global.oei.domain.shared.badge.BadgeAward;
import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.RejectCertificationUseCase;
import global.oei.domain.shared.certification.ValidateCertificationUseCase;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.MemberPort;
import global.oei.domain.shared.security.SecurityContextPort;
import global.oei.domain.shared.verification.ApproveVerificationRequestUseCase;
import global.oei.domain.shared.verification.RejectVerificationRequestUseCase;
import global.oei.domain.shared.verification.VerificationRequest;
import lombok.RequiredArgsConstructor;

/**
 * Passes the currently authenticated admin's own subject as the {@code validatorId}/
 * {@code reviewerId}/{@code awardedBy} actor on every write operation below — same convention
 * as {@code ContentService.currentActorId()}.
 */
@Service
@RequiredArgsConstructor
public class AdminMembersService implements AdminMembersAdapter {

    private final MemberPort memberPort;
    private final ValidateCertificationUseCase validateCertificationUseCase;
    private final RejectCertificationUseCase rejectCertificationUseCase;
    private final AwardBadgeUseCase awardBadgeUseCase;
    private final ApproveVerificationRequestUseCase approveVerificationRequestUseCase;
    private final RejectVerificationRequestUseCase rejectVerificationRequestUseCase;
    private final SecurityContextPort securityContextPort;

    @Override
    public List<Member> listAdminMembers() {
        return memberPort.findAll();
    }

    @Override
    public Optional<Certification> validateCertification(final String certificationId) {
        return validateCertificationUseCase.execute(certificationId, currentActorId());
    }

    @Override
    public Optional<Certification> rejectCertification(final String certificationId) {
        return rejectCertificationUseCase.execute(certificationId, currentActorId());
    }

    @Override
    public BadgeAward awardBadge(final String memberId, final String badgeId) {
        return awardBadgeUseCase.execute(MemberId.of(memberId), badgeId, currentActorId());
    }

    @Override
    public Optional<VerificationRequest> approveVerificationRequest(final String requestId) {
        return approveVerificationRequestUseCase.execute(requestId, currentActorId());
    }

    @Override
    public Optional<VerificationRequest> rejectVerificationRequest(final String requestId) {
        return rejectVerificationRequestUseCase.execute(requestId, currentActorId());
    }

    private String currentActorId() {
        return securityContextPort.currentIdentity().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED)).subject();
    }
}
