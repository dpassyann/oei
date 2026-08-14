package global.oei.infrastructure.persistence.event;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRegistrationRepository extends JpaRepository<EventRegistrationEntity, UUID> {

    Optional<EventRegistrationEntity> findByEventIdAndMemberId(UUID eventId, UUID memberId);

    long countByEventId(UUID eventId);

    void deleteByEventIdAndMemberId(UUID eventId, UUID memberId);
}
