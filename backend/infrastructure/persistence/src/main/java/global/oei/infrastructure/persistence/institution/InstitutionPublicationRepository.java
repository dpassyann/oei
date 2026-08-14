package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionPublicationRepository extends JpaRepository<InstitutionPublicationEntity, UUID> {

    List<InstitutionPublicationEntity> findByInstitutionId(UUID institutionId);

    List<InstitutionPublicationEntity> findByInstitutionIdAndStatus(UUID institutionId, String status);

    long countByInstitutionId(UUID institutionId);
}
