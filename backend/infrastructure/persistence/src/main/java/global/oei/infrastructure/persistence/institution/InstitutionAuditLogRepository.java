package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionAuditLogRepository extends JpaRepository<InstitutionAuditLogEntity, UUID> {

    List<InstitutionAuditLogEntity> findByInstitutionIdOrderByOccurredAtDesc(UUID institutionId);

    List<InstitutionAuditLogEntity> findAllByOrderByOccurredAtDesc();
}
