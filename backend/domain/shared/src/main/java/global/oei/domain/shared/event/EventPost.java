package global.oei.domain.shared.event;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A short live-feed post on an {@link Event}. {@link #likedByMemberIds()} backs both
 * {@code likesCount} ({@code size()}) and the per-viewer {@code likedByMe} flag computed at
 * the DTO-mapping boundary — see {@link #like(MemberId)}.
 */
public record EventPost(
        String id,
        String eventId,
        MemberId authorId,
        String authorName,
        String text,
        String photoUrl,
        Instant createdAt,
        List<MemberId> likedByMemberIds) {

    public EventPost {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(eventId, "eventId must not be null");
        Objects.requireNonNull(authorId, "authorId must not be null");
        Objects.requireNonNull(text, "text must not be null");
        likedByMemberIds = List.copyOf(likedByMemberIds == null ? List.of() : likedByMemberIds);
    }

    /**
     * @return a new instance with {@code memberId} added to {@link #likedByMemberIds()};
     *         idempotent — liking twice has no additional effect
     */
    public EventPost like(final MemberId memberId) {
        if (likedByMemberIds.contains(memberId)) {
            return this;
        }
        final List<MemberId> updated = new java.util.ArrayList<>(likedByMemberIds);
        updated.add(memberId);
        return new EventPost(id, eventId, authorId, authorName, text, photoUrl, createdAt, updated);
    }
}
