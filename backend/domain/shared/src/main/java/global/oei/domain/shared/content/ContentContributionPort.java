package global.oei.domain.shared.content;

import java.util.List;

/**
 * Outbound port for {@link ContentContribution}.
 */
public interface ContentContributionPort {

    List<ContentContribution> findByContentId(String contentId);
}
