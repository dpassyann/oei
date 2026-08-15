package global.oei.domain.shared.content;

import global.oei.domain.shared.member.MemberId;

/**
 * Proposes a new {@link ContentContribution} (a Markdown patch) on a {@link Content}.
 */
public interface CreateContentContributionUseCase {

    ContentContribution execute(MemberId authorMemberId, String contentId, String patch);
}
