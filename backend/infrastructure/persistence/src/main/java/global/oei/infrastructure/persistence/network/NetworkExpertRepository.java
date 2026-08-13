package global.oei.infrastructure.persistence.network;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NetworkExpertRepository extends JpaRepository<NetworkExpertEntity, UUID> {

    Page<NetworkExpertEntity> findByTopicId(String topicId, Pageable pageable);

    boolean existsByTopicId(String topicId);
}
