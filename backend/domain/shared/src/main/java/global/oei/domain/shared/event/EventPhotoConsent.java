package global.oei.domain.shared.event;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * Explicit consent to publish a member's photos on an event's feed — distinct from
 * {@link EventRegistration}, which never implies photo-publication consent (see the
 * operation's own contract summary).
 */
public record EventPhotoConsent(String eventId, MemberId memberId, Instant consentedAt) {

    public EventPhotoConsent {
        Objects.requireNonNull(eventId, "eventId must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(consentedAt, "consentedAt must not be null");
    }
}
