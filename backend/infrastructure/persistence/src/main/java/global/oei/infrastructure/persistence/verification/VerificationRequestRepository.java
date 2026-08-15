package global.oei.infrastructure.persistence.verification;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationRequestRepository extends JpaRepository<VerificationRequestEntity, UUID> {

    List<VerificationRequestEntity> findByMemberId(UUID memberId);
}
