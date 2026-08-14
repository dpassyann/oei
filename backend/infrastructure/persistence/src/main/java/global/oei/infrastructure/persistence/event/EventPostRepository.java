package global.oei.infrastructure.persistence.event;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EventPostRepository extends JpaRepository<EventPostEntity, UUID> {

    List<EventPostEntity> findByEventId(UUID eventId);
}
