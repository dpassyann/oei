package global.oei.infrastructure.persistence.git;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GitSynchronizationRepository extends JpaRepository<GitSynchronizationEntity, UUID> {

    List<GitSynchronizationEntity> findAllByOrderByStartedAtDesc();
}
