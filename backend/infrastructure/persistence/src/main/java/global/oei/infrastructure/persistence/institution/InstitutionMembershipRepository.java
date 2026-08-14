package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionMembershipRepository extends JpaRepository<InstitutionMembershipEntity, InstitutionMembershipId> {

    List<InstitutionMembershipEntity> findByInstitutionId(UUID institutionId);

    Optional<InstitutionMembershipEntity> findByInstitutionIdAndMemberId(UUID institutionId, UUID memberId);

    void deleteByInstitutionIdAndMemberId(UUID institutionId, UUID memberId);
}
