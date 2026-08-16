package global.oei.application.web.resource.certification.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationLevel;
import global.oei.domain.shared.certification.CertificationOeiStatus;
import global.oei.domain.shared.certification.MemberCertificationGoal;
import global.oei.domain.shared.certification.MemberCertificationGoalStatus;
import global.oei.domain.shared.certification.RecognizedCertification;
import global.oei.domain.shared.certification.RecognizedCertificationPage;

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

    // --- admin catalog governance (/api/admin/v1/certifications/catalog) ---

    RecognizedCertificationPage listRecognizedCertificationCatalog(int page, int pageSize);

    RecognizedCertification createRecognizedCertificationCatalogEntry(
            String name, String issuingOrganization, String catalogReference, boolean autoValidate, String domain,
            CertificationLevel level, String language, CertificationOeiStatus oeiStatus, List<String> competencies,
            Integer validityMonths, String associatedPathRoute, String description);

    Optional<RecognizedCertification> updateRecognizedCertificationCatalogEntry(String id, RecognizedCertification submitted);

    Optional<RecognizedCertification> archiveRecognizedCertificationCatalogEntry(String id);
}
