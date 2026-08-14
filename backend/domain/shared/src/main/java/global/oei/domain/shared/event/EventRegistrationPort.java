package global.oei.domain.shared.event;

import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link EventRegistration}.
 */
public interface EventRegistrationPort {

    EventRegistration save(EventRegistration registration);

    Optional<EventRegistration> findByEventIdAndMemberId(String eventId, MemberId memberId);

    int countByEventId(String eventId);

    void delete(String eventId, MemberId memberId);
}
