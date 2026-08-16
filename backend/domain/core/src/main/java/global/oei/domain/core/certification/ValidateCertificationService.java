package global.oei.domain.core.certification;

import java.time.Instant;
import java.util.Optional;

import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationPort;
import global.oei.domain.shared.certification.ValidateCertificationUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Manually validates a declared {@link Certification}.
 */
@Slf4j
@RequiredArgsConstructor
public class ValidateCertificationService implements ValidateCertificationUseCase {

    @NonNull
    private final CertificationPort certificationPort;

    @Override
    public Optional<Certification> execute(final String certificationId, final String validatorId) {
        log.debug("ValidateCertificationService: execute called");
        return certificationPort.findById(certificationId)
                .map(certification -> certificationPort.save(certification.validate(validatorId, Instant.now())));
    }
}
