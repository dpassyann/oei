package global.oei.domain.core.event;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.event.EventRegistration;
import global.oei.domain.shared.event.EventRegistrationPort;
import global.oei.domain.shared.event.RegisterToEventUseCase;
import global.oei.domain.shared.member.MemberId;

/** Idempotent: registering twice returns the existing registration rather than duplicating it. */
public class RegisterToEventService implements RegisterToEventUseCase {

    private final EventRegistrationPort eventRegistrationPort;

    public RegisterToEventService(final EventRegistrationPort eventRegistrationPort) {
        this.eventRegistrationPort = Objects.requireNonNull(eventRegistrationPort, "eventRegistrationPort must not be null");
    }

    @Override
    public EventRegistration execute(final String eventId, final MemberId memberId) {
        return eventRegistrationPort.findByEventIdAndMemberId(eventId, memberId)
                .orElseGet(() -> eventRegistrationPort.save(
                        new EventRegistration(UUID.randomUUID().toString(), eventId, memberId, Instant.now())));
    }
}
