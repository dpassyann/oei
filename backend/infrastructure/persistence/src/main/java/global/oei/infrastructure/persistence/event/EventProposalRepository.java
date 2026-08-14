package global.oei.infrastructure.persistence.event;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EventProposalRepository extends JpaRepository<EventProposalEntity, UUID> {

    List<EventProposalEntity> findByAuthorId(UUID authorId);

    List<EventProposalEntity> findByStatus(String status);
}
