package global.oei.application.web.resource.certification.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.MemberCertificationGoal;
import global.oei.domain.shared.certification.MemberCertificationGoalStatus;

public interface CertificationAdapter {

    List<Certification> listMyCertifications();

    Certification declareCertification(
            String name,
            String issuingOrganization,
            String recognizedCertificationId,
            LocalDate issuedAt,
            LocalDate expiresAt,
            String proofDocumentUrl);

    Optional<Certification> getMyCertification(String id);

    List<MemberCertificationGoal> listMyCertificationGoals();

    MemberCertificationGoal upsertMyCertificationGoal(String recognizedCertificationId, MemberCertificationGoalStatus status);
}
