package global.oei.infrastructure.persistence.content;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionPort;
import global.oei.domain.shared.content.ContentContributionStatus;
import global.oei.domain.shared.member.MemberId;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentContributionPersistenceAdapter implements ContentContributionPort {

    private final ContentContributionRepository repository;

    @Override
    public List<ContentContribution> findByContentId(final String contentId) {
        return repository.findByContentId(UUID.fromString(contentId)).stream()
                .map(ContentContributionPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public List<ContentContribution> findByAuthorMemberId(final MemberId authorMemberId) {
        return repository.findByAuthorMemberId(authorMemberId.value()).stream()
                .map(ContentContributionPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public Optional<ContentContribution> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(ContentContributionPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public ContentContribution save(final ContentContribution contribution) {
        final ContentContributionEntity entity = new ContentContributionEntity(
                UUID.fromString(contribution.id()),
                UUID.fromString(contribution.contentId()),
                contribution.patch(),
                contribution.authorMemberId().value(),
                contribution.status().name(),
                contribution.createdAt());
        repository.save(entity);
        return contribution;
    }

    private static ContentContribution toDomain(final ContentContributionEntity entity) {
        return new ContentContribution(
                entity.getId().toString(), entity.getContentId().toString(), entity.getPatch(),
                new MemberId(entity.getAuthorMemberId()), ContentContributionStatus.valueOf(entity.getStatus()),
                entity.getCreatedAt());
    }
}
