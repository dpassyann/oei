package global.oei.infrastructure.persistence.badge;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeAwardRepository extends JpaRepository<BadgeAwardEntity, UUID> {

    List<BadgeAwardEntity> findByMemberId(UUID memberId);
}
