package global.oei.infrastructure.persistence.event;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EventPhotoConsentRepository extends JpaRepository<EventPhotoConsentEntity, EventPhotoConsentId> {

    Optional<EventPhotoConsentEntity> findByEventIdAndMemberId(UUID eventId, UUID memberId);
}
