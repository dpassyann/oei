package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionOpportunityRepository extends JpaRepository<InstitutionOpportunityEntity, UUID> {

    List<InstitutionOpportunityEntity> findByInstitutionId(UUID institutionId);

    List<InstitutionOpportunityEntity> findByInstitutionIdAndStatus(UUID institutionId, String status);

    long countByInstitutionId(UUID institutionId);
}
