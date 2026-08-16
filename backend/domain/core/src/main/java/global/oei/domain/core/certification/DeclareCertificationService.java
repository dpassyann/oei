package global.oei.domain.core.certification;

import java.time.LocalDate;
import java.util.UUID;

import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationPort;
import global.oei.domain.shared.certification.CertificationStatus;
import global.oei.domain.shared.certification.DeclareCertificationUseCase;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Default {@code DeclareCertificationUseCase} implementation.
 */
@Slf4j
@RequiredArgsConstructor
public class DeclareCertificationService implements DeclareCertificationUseCase {

    @NonNull
    private final CertificationPort certificationPort;

    @Override
    public Certification execute(
            final MemberId memberId,
            final String name,
            final String issuingOrganization,
            final String recognizedCertificationId,
            final LocalDate issuedAt,
            final LocalDate expiresAt,
            final String proofDocumentUrl) {
        log.debug("declareCertification: memberId={} name={} recognizedCertificationId={}", memberId, name, recognizedCertificationId);
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
        log.info("declareCertification: declared certificationId={} memberId={}", certification.id(), memberId);
        return certificationPort.save(certification);
    }
}
