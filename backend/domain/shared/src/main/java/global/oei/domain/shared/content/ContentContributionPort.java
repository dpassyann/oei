package global.oei.domain.shared.content;

import java.util.List;

public interface ContentContributionPort {

    List<ContentContribution> findByContentId(String contentId);
}
