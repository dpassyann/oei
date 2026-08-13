package global.oei.infrastructure.persistence.certification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberCertificationGoalRepository extends JpaRepository<MemberCertificationGoalEntity, UUID> {

    List<MemberCertificationGoalEntity> findByMemberId(UUID memberId);

    Optional<MemberCertificationGoalEntity> findByMemberIdAndRecognizedCertificationId(
            UUID memberId, String recognizedCertificationId);
}
