package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmploymentAffiliationRepository extends JpaRepository<EmploymentAffiliationEntity, UUID> {

    List<EmploymentAffiliationEntity> findByMemberId(UUID memberId);

    List<EmploymentAffiliationEntity> findByInstitutionId(UUID institutionId);

    List<EmploymentAffiliationEntity> findByInstitutionIdAndStatus(UUID institutionId, String status);

    long countByInstitutionIdAndStatus(UUID institutionId, String status);
}
