package global.oei.domain.shared.certification;

import java.util.Optional;

/**
 * Outbound port for the {@link RecognizedCertification} public catalog.
 */
public interface RecognizedCertificationPort {

    Optional<RecognizedCertification> findById(String id);

    RecognizedCertificationPage findCatalog(int page, int pageSize);

    RecognizedCertification save(RecognizedCertification recognizedCertification);
}
