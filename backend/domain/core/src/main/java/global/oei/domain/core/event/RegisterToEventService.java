package global.oei.domain.core.event;

import java.time.Instant;
import java.util.UUID;

import global.oei.domain.shared.event.EventRegistration;
import global.oei.domain.shared.event.EventRegistrationPort;
import global.oei.domain.shared.event.RegisterToEventUseCase;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/** Idempotent: registering twice returns the existing registration rather than duplicating it. */
@Slf4j
@RequiredArgsConstructor
public class RegisterToEventService implements RegisterToEventUseCase {

    @NonNull
    private final EventRegistrationPort eventRegistrationPort;

    @Override
    public EventRegistration execute(final String eventId, final MemberId memberId) {
        log.debug("registerToEvent: eventId={} memberId={}", eventId, memberId);
        return eventRegistrationPort.findByEventIdAndMemberId(eventId, memberId)
                .orElseGet(() -> {
                    log.info("registerToEvent: creating new registration eventId={} memberId={}", eventId, memberId);
                    return eventRegistrationPort.save(
                            new EventRegistration(UUID.randomUUID().toString(), eventId, memberId, Instant.now()));
                });
    }
}
