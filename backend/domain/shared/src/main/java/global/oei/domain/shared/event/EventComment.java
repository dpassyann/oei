package global.oei.domain.shared.event;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A comment on an {@link EventPost}, restricted to members who attended the event.
 */
public record EventComment(
        String id,
        String eventId,
        String postId,
        MemberId authorId,
        String authorName,
        String text,
        Instant createdAt,
        EventCommentStatus status) {

    public EventComment {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(eventId, "eventId must not be null");
        Objects.requireNonNull(postId, "postId must not be null");
        Objects.requireNonNull(authorId, "authorId must not be null");
        Objects.requireNonNull(text, "text must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }

    /** @return a new instance moved to {@link EventCommentStatus#HIDDEN} (moderation) */
    public EventComment hide() {
        return new EventComment(id, eventId, postId, authorId, authorName, text, createdAt, EventCommentStatus.HIDDEN);
    }
}
