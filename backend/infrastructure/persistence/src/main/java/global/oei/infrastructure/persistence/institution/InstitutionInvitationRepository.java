package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionInvitationRepository extends JpaRepository<InstitutionInvitationEntity, UUID> {

    List<InstitutionInvitationEntity> findByInstitutionId(UUID institutionId);

    long countByInstitutionId(UUID institutionId);
}
