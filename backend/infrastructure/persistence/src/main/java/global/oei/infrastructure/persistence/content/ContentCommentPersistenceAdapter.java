package global.oei.infrastructure.persistence.content;

import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.content.ContentComment;
import global.oei.domain.shared.content.ContentCommentPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentCommentPersistenceAdapter implements ContentCommentPort {

    private final ContentCommentRepository repository;

    @Override
    public List<ContentComment> findByContributionId(final String contributionId) {
        return repository.findByContributionId(UUID.fromString(contributionId)).stream()
                .map(ContentCommentPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public ContentComment save(final ContentComment comment) {
        final ContentCommentEntity entity = new ContentCommentEntity(
                UUID.fromString(comment.id()),
                comment.contributionId() == null ? null : UUID.fromString(comment.contributionId()),
                comment.contentId() == null ? null : UUID.fromString(comment.contentId()),
                comment.authorId(),
                comment.body(),
                comment.createdAt());
        repository.save(entity);
        return comment;
    }

    private static ContentComment toDomain(final ContentCommentEntity entity) {
        return new ContentComment(
                entity.getId().toString(),
                entity.getContributionId() == null ? null : entity.getContributionId().toString(),
                entity.getContentId() == null ? null : entity.getContentId().toString(),
                entity.getAuthorId(),
                entity.getBody(),
                entity.getCreatedAt());
    }
}
