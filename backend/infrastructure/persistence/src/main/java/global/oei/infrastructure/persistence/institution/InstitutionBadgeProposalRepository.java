package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionBadgeProposalRepository extends JpaRepository<InstitutionBadgeProposalEntity, UUID> {

    List<InstitutionBadgeProposalEntity> findByInstitutionId(UUID institutionId);
}
