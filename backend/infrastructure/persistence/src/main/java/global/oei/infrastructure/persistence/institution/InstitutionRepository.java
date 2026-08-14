package global.oei.infrastructure.persistence.institution;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionRepository extends JpaRepository<InstitutionEntity, UUID> {

    Optional<InstitutionEntity> findByPublicSlug(String publicSlug);
}
