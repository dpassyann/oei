package global.oei.domain.core.certification;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationPort;
import global.oei.domain.shared.certification.CertificationStatus;
import global.oei.domain.shared.certification.DeclareCertificationUseCase;
import global.oei.domain.shared.member.MemberId;

/**
 * Default {@code DeclareCertificationUseCase} implementation.
 */
public class DeclareCertificationService implements DeclareCertificationUseCase {

    private final CertificationPort certificationPort;

    public DeclareCertificationService(final CertificationPort certificationPort) {
        this.certificationPort = Objects.requireNonNull(certificationPort, "certificationPort must not be null");
    }

    @Override
    public Certification execute(
            final MemberId memberId,
            final String name,
            final String issuingOrganization,
            final String recognizedCertificationId,
            final LocalDate issuedAt,
            final LocalDate expiresAt,
            final String proofDocumentUrl) {
        final Certification certification = new Certification(
                UUID.randomUUID().toString(),
                memberId,
                name,
                issuingOrganization,
                recognizedCertificationId,
                issuedAt,
                expiresAt,
                proofDocumentUrl,
                CertificationStatus.DECLARED,
                null,
                null);
        return certificationPort.save(certification);
    }
}
