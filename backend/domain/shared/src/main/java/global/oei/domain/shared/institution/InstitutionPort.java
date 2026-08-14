package global.oei.domain.shared.institution;

import java.util.Optional;

public interface InstitutionPort {

    Optional<Institution> findById(InstitutionId id);

    Optional<Institution> findByPublicSlug(String publicSlug);

    Institution save(Institution institution);
}
