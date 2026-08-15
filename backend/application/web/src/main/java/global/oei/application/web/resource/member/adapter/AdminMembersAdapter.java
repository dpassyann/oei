package global.oei.application.web.resource.member.adapter;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.badge.BadgeAward;
import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.verification.VerificationRequest;

public interface AdminMembersAdapter {

    List<Member> listAdminMembers();

    Optional<Certification> validateCertification(String certificationId);

    Optional<Certification> rejectCertification(String certificationId);

    BadgeAward awardBadge(String memberId, String badgeId);

    Optional<VerificationRequest> approveVerificationRequest(String requestId);

    Optional<VerificationRequest> rejectVerificationRequest(String requestId);
}
