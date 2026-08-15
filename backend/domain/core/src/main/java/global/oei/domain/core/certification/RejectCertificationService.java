package global.oei.domain.core.certification;

import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationPort;
import global.oei.domain.shared.certification.RejectCertificationUseCase;

/**
 * Rejects a declared {@link Certification}.
 */
public class RejectCertificationService implements RejectCertificationUseCase {

    private final CertificationPort certificationPort;

    public RejectCertificationService(final CertificationPort certificationPort) {
        this.certificationPort = Objects.requireNonNull(certificationPort, "certificationPort must not be null");
    }

    @Override
    public Optional<Certification> execute(final String certificationId, final String validatorId) {
        return certificationPort.findById(certificationId)
                .map(certification -> certificationPort.save(certification.reject(validatorId, Instant.now())));
    }
}
