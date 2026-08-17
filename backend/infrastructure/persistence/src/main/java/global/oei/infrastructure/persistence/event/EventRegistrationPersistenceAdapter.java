package global.oei.infrastructure.persistence.event;

import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.event.EventRegistration;
import global.oei.domain.shared.event.EventRegistrationPort;
import global.oei.domain.shared.member.MemberId;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventRegistrationPersistenceAdapter implements EventRegistrationPort {

    private final EventRegistrationRepository repository;

    @Override
    @Transactional
    public EventRegistration save(final EventRegistration registration) {
        final EventRegistrationEntity entity = new EventRegistrationEntity(
                UUID.fromString(registration.id()), UUID.fromString(registration.eventId()), registration.memberId().value(),
                registration.registeredAt());
        repository.save(entity);
        return registration;
    }

    @Override
    public Optional<EventRegistration> findByEventIdAndMemberId(final String eventId, final MemberId memberId) {
        return repository.findByEventIdAndMemberId(UUID.fromString(eventId), memberId.value())
                .map(entity -> new EventRegistration(
                        entity.getId().toString(), entity.getEventId().toString(), new MemberId(entity.getMemberId()),
                        entity.getRegisteredAt()));
    }

    @Override
    public int countByEventId(final String eventId) {
        return (int) repository.countByEventId(UUID.fromString(eventId));
    }

    @Override
    @Transactional
    public void delete(final String eventId, final MemberId memberId) {
        repository.deleteByEventIdAndMemberId(UUID.fromString(eventId), memberId.value());
    }
}
