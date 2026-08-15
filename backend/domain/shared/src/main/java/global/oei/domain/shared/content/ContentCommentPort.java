package global.oei.domain.shared.content;

import java.util.List;

/**
 * Outbound port for {@link ContentComment}.
 */
public interface ContentCommentPort {

    List<ContentComment> findByContributionId(String contributionId);

    ContentComment save(ContentComment comment);
}
