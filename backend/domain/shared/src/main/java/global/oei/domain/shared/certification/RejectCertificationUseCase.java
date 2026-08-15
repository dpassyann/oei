package global.oei.domain.shared.certification;

import java.util.Optional;

/**
 * Inbound port: reject a declared {@link Certification}.
 */
public interface RejectCertificationUseCase {

    Optional<Certification> execute(String certificationId, String validatorId);
}
