package global.oei.domain.shared.institution;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for {@link InstitutionPublication}.
 */
public interface InstitutionPublicationPort {

    List<InstitutionPublication> findByInstitutionId(InstitutionId institutionId);

    List<InstitutionPublication> findPublishedByInstitutionId(InstitutionId institutionId);

    Optional<InstitutionPublication> findById(String id);

    InstitutionPublication save(InstitutionPublication publication);
}
