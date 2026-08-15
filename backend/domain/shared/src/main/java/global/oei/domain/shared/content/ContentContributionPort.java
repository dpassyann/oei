package global.oei.domain.shared.content;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link ContentContribution}.
 */
public interface ContentContributionPort {

    List<ContentContribution> findByContentId(String contentId);

    List<ContentContribution> findByAuthorMemberId(MemberId authorMemberId);

    Optional<ContentContribution> findById(String id);

    ContentContribution save(ContentContribution contribution);
}
