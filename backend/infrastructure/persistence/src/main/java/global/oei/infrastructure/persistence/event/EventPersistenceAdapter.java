package global.oei.infrastructure.persistence.event;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import global.oei.domain.shared.event.Event;
import global.oei.domain.shared.event.EventLocation;
import global.oei.domain.shared.event.EventPort;
import global.oei.domain.shared.event.EventSpeaker;
import global.oei.domain.shared.event.EventStatus;
import global.oei.domain.shared.event.EventType;
import global.oei.domain.shared.event.EventVisibility;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventPersistenceAdapter implements EventPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final List<String> PUBLISHED_STATUSES = List.of(
            EventStatus.PUBLISHED.name(), EventStatus.REGISTRATION_OPEN.name(), EventStatus.REGISTRATION_CLOSED.name(),
            EventStatus.LIVE.name(), EventStatus.ENDED.name(), EventStatus.ARCHIVED.name());

    private final EventRepository repository;

    @Override
    @Transactional
    public Event save(final Event event) {
        final EventEntity entity = new EventEntity(
                UUID.fromString(event.id()), event.slug(), event.title(), event.type().name(), event.description(), event.imageUrl(),
                event.location().country(), event.location().city(), event.location().venue(), event.location().onlineUrl(),
                event.startAt(), event.endAt(), event.timezone(), event.capacity(), event.registrationsCount(),
                event.visibility().name(), toJson(event.organizers()), toJson(event.languages()), toJson(event.speakers()),
                event.status().name(), event.commentsOpenAt(), event.commentsClosedAt(), event.summary(),
                toJson(event.galleryImageUrls()));
        repository.save(entity);
        return event;
    }

    @Override
    public Optional<Event> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(EventPersistenceAdapter::toDomain);
    }

    @Override
    public Optional<Event> findBySlug(final String slug) {
        return repository.findBySlug(slug).map(EventPersistenceAdapter::toDomain);
    }

    @Override
    public List<Event> findAll() {
        return repository.findAll().stream().map(EventPersistenceAdapter::toDomain).toList();
    }

    @Override
    public List<Event> findPublished() {
        return repository.findByStatusIn(PUBLISHED_STATUSES).stream().map(EventPersistenceAdapter::toDomain).toList();
    }

    @SneakyThrows
    private static Event toDomain(final EventEntity entity) {
        final List<String> organizers = readList(entity.getOrganizersJson());
        final List<String> languages = readList(entity.getLanguagesJson());
        final List<String> galleryImageUrls = readList(entity.getGalleryImageUrlsJson());
        final List<EventSpeaker> speakers = entity.getSpeakersJson() == null
                ? List.of()
                : OBJECT_MAPPER.readValue(entity.getSpeakersJson(), OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, EventSpeaker.class));
        return new Event(
                entity.getId().toString(), entity.getSlug(), entity.getTitle(), EventType.valueOf(entity.getType()),
                entity.getDescription(), entity.getImageUrl(),
                new EventLocation(entity.getLocationCountry(), entity.getLocationCity(), entity.getLocationVenue(), entity.getLocationOnlineUrl()),
                entity.getStartAt(), entity.getEndAt(), entity.getTimezone(), entity.getCapacity(), entity.getRegistrationsCount(),
                EventVisibility.valueOf(entity.getVisibility()), organizers, languages, speakers, EventStatus.valueOf(entity.getStatus()),
                entity.getCommentsOpenAt(), entity.getCommentsClosedAt(), entity.getSummary(), galleryImageUrls);
    }

    @SneakyThrows
    private static List<String> readList(final String json) {
        return json == null ? List.of() : OBJECT_MAPPER.readValue(json, OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, String.class));
    }

    @SneakyThrows
    private static String toJson(final Object value) {
        return OBJECT_MAPPER.writeValueAsString(value);
    }
}
