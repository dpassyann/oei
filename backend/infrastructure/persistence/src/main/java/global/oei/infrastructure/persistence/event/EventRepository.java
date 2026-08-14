package global.oei.infrastructure.persistence.event;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<EventEntity, UUID> {

    Optional<EventEntity> findBySlug(String slug);

    List<EventEntity> findByStatusIn(List<String> statuses);
}
