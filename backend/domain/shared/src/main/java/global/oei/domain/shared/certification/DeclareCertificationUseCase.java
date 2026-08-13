package global.oei.domain.shared.certification;

import java.time.LocalDate;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: declare a certification. Always starts {@link CertificationStatus#DECLARED}
 * — see {@link Certification}'s Javadoc for why catalog-based auto-validation is out of
 * scope for now.
 */
public interface DeclareCertificationUseCase {

    Certification execute(
            MemberId memberId,
            String name,
            String issuingOrganization,
            String recognizedCertificationId,
            LocalDate issuedAt,
            LocalDate expiresAt,
            String proofDocumentUrl);
}
