package global.oei.domain.shared.event;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/** Only status in this iteration is {@code GOING} — see the contract's own enum. */
public record EventRegistration(String id, String eventId, MemberId memberId, Instant registeredAt) {

    public EventRegistration {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(eventId, "eventId must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(registeredAt, "registeredAt must not be null");
    }
}
