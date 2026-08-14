package global.oei.infrastructure.persistence.content;

import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionPort;
import global.oei.domain.shared.content.ContentContributionStatus;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentContributionPersistenceAdapter implements ContentContributionPort {

    private final ContentContributionRepository repository;

    @Override
    public List<ContentContribution> findByContentId(final String contentId) {
        return repository.findByContentId(UUID.fromString(contentId)).stream()
                .map(entity -> new ContentContribution(
                        entity.getId().toString(), entity.getContentId().toString(), entity.getPatch(),
                        new MemberId(entity.getAuthorMemberId()), ContentContributionStatus.valueOf(entity.getStatus()),
                        entity.getCreatedAt()))
                .toList();
    }
}
