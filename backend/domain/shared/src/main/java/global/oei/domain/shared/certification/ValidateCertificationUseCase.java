package global.oei.domain.shared.certification;

import java.util.Optional;

/**
 * Inbound port: manually validate a declared {@link Certification} (outside any
 * auto-validated catalog — see {@link Certification}'s Javadoc).
 */
public interface ValidateCertificationUseCase {

    Optional<Certification> execute(String certificationId, String validatorId);
}
