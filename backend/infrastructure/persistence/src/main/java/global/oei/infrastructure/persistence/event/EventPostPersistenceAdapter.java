package global.oei.infrastructure.persistence.event;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.event.EventPost;
import global.oei.domain.shared.event.EventPostPort;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventPostPersistenceAdapter implements EventPostPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final EventPostRepository repository;

    @Override
    @Transactional
    public EventPost save(final EventPost post) {
        final EventPostEntity entity = new EventPostEntity(
                UUID.fromString(post.id()), UUID.fromString(post.eventId()), post.authorId().value(), post.authorName(), post.text(),
                post.photoUrl(), post.createdAt(), toJson(post.likedByMemberIds()));
        repository.save(entity);
        return post;
    }

    @Override
    public Optional<EventPost> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(EventPostPersistenceAdapter::toDomain);
    }

    @Override
    public List<EventPost> findByEventId(final String eventId) {
        return repository.findByEventId(UUID.fromString(eventId)).stream().map(EventPostPersistenceAdapter::toDomain).toList();
    }

    @SneakyThrows
    private static EventPost toDomain(final EventPostEntity entity) {
        final List<String> likedByRaw = entity.getLikedByJson() == null
                ? List.of()
                : OBJECT_MAPPER.readValue(entity.getLikedByJson(), OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, String.class));
        final List<MemberId> likedBy = likedByRaw.stream().map(MemberId::of).toList();
        return new EventPost(
                entity.getId().toString(), entity.getEventId().toString(), new MemberId(entity.getAuthorId()), entity.getAuthorName(),
                entity.getText(), entity.getPhotoUrl(), entity.getCreatedAt(), likedBy);
    }

    @SneakyThrows
    private static String toJson(final List<MemberId> likedBy) {
        return OBJECT_MAPPER.writeValueAsString(likedBy.stream().map(MemberId::toString).toList());
    }
}
