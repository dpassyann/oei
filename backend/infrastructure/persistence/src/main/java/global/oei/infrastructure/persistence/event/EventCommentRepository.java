package global.oei.infrastructure.persistence.event;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EventCommentRepository extends JpaRepository<EventCommentEntity, UUID> {
}
