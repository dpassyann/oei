package global.oei.domain.core.certification;

import java.time.Instant;
import java.util.Optional;

import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationPort;
import global.oei.domain.shared.certification.RejectCertificationUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Rejects a declared {@link Certification}.
 */
@Slf4j
@RequiredArgsConstructor
public class RejectCertificationService implements RejectCertificationUseCase {

    @NonNull
    private final CertificationPort certificationPort;

    @Override
    public Optional<Certification> execute(final String certificationId, final String validatorId) {
        log.debug("RejectCertificationService: execute called");
        return certificationPort.findById(certificationId)
                .map(certification -> certificationPort.save(certification.reject(validatorId, Instant.now())));
    }
}
