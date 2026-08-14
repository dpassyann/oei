package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionDomainRepository extends JpaRepository<InstitutionDomainEntity, UUID> {

    List<InstitutionDomainEntity> findByInstitutionId(UUID institutionId);
}
