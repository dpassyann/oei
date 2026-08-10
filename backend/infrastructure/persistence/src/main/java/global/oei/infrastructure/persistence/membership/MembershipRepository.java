package global.oei.infrastructure.persistence.membership;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipRepository extends JpaRepository<MembershipEntity, UUID> {

    Optional<MembershipEntity> findByMemberId(UUID memberId);
}
