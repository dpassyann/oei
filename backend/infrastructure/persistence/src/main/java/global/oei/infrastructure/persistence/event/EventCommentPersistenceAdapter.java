package global.oei.infrastructure.persistence.event;

import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.event.EventComment;
import global.oei.domain.shared.event.EventCommentPort;
import global.oei.domain.shared.event.EventCommentStatus;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventCommentPersistenceAdapter implements EventCommentPort {

    private final EventCommentRepository repository;

    @Override
    @Transactional
    public EventComment save(final EventComment comment) {
        final EventCommentEntity entity = new EventCommentEntity(
                UUID.fromString(comment.id()), UUID.fromString(comment.eventId()), UUID.fromString(comment.postId()),
                comment.authorId().value(), comment.authorName(), comment.text(), comment.createdAt(), comment.status().name());
        repository.save(entity);
        return comment;
    }

    @Override
    public Optional<EventComment> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(entity -> new EventComment(
                entity.getId().toString(), entity.getEventId().toString(), entity.getPostId().toString(),
                new MemberId(entity.getAuthorId()), entity.getAuthorName(), entity.getText(), entity.getCreatedAt(),
                EventCommentStatus.valueOf(entity.getStatus())));
    }
}
