package global.oei.domain.shared.event;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

public record Event(
        String id,
        String slug,
        String title,
        EventType type,
        String description,
        String imageUrl,
        EventLocation location,
        Instant startAt,
        Instant endAt,
        String timezone,
        Integer capacity,
        int registrationsCount,
        EventVisibility visibility,
        List<String> organizers,
        List<String> languages,
        List<EventSpeaker> speakers,
        EventStatus status,
        Instant commentsOpenAt,
        Instant commentsClosedAt,
        String summary,
        List<String> galleryImageUrls) {

    public Event {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(slug, "slug must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(type, "type must not be null");
        Objects.requireNonNull(description, "description must not be null");
        Objects.requireNonNull(location, "location must not be null");
        Objects.requireNonNull(startAt, "startAt must not be null");
        Objects.requireNonNull(endAt, "endAt must not be null");
        Objects.requireNonNull(timezone, "timezone must not be null");
        Objects.requireNonNull(visibility, "visibility must not be null");
        Objects.requireNonNull(status, "status must not be null");
        organizers = List.copyOf(organizers == null ? List.of() : organizers);
        languages = List.copyOf(languages == null ? List.of() : languages);
        speakers = List.copyOf(speakers == null ? List.of() : speakers);
        galleryImageUrls = List.copyOf(galleryImageUrls == null ? List.of() : galleryImageUrls);
    }

    /**
     * @return whether {@code startAt <= now <= endAt} (commenting window default when
     *         {@link #commentsOpenAt()}/{@link #commentsClosedAt()} are not explicitly set)
     */
    public boolean isWithinCommentsWindow(final Instant now) {
        final Instant open = commentsOpenAt != null ? commentsOpenAt : startAt;
        final Instant close = commentsClosedAt != null ? commentsClosedAt : endAt;
        return !now.isBefore(open) && !now.isAfter(close);
    }

    public Event withRegistrationsCount(final int newCount) {
        return new Event(
                id, slug, title, type, description, imageUrl, location, startAt, endAt, timezone, capacity, newCount, visibility,
                organizers, languages, speakers, status, commentsOpenAt, commentsClosedAt, summary, galleryImageUrls);
    }
}
