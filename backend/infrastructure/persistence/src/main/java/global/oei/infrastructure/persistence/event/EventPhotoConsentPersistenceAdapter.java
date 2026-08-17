package global.oei.infrastructure.persistence.event;

import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.event.EventPhotoConsent;
import global.oei.domain.shared.event.EventPhotoConsentPort;
import global.oei.domain.shared.member.MemberId;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventPhotoConsentPersistenceAdapter implements EventPhotoConsentPort {

    private final EventPhotoConsentRepository repository;

    @Override
    @Transactional
    public EventPhotoConsent save(final EventPhotoConsent consent) {
        final EventPhotoConsentEntity entity =
                new EventPhotoConsentEntity(UUID.fromString(consent.eventId()), consent.memberId().value(), consent.consentedAt());
        repository.save(entity);
        return consent;
    }

    @Override
    public Optional<EventPhotoConsent> findByEventIdAndMemberId(final String eventId, final MemberId memberId) {
        return repository.findByEventIdAndMemberId(UUID.fromString(eventId), memberId.value())
                .map(entity -> new EventPhotoConsent(entity.getEventId().toString(), new MemberId(entity.getMemberId()), entity.getConsentedAt()));
    }
}
