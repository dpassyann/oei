package global.oei.domain.shared.institution;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for {@link Institution}.
 */
public interface InstitutionPort {

    Optional<Institution> findById(InstitutionId id);

    Optional<Institution> findByPublicSlug(String publicSlug);

    List<Institution> findAll();

    Institution save(Institution institution);

    InstitutionDomain addDomain(InstitutionId institutionId, InstitutionDomain domain);
}
