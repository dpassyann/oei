package global.oei.domain.shared.content;

import java.util.List;

/**
 * Inbound port: create a new {@link Content} item.
 */
public interface CreateContentUseCase {

    Content execute(
            ContentType type, String slug, ContentSourceType sourceType, String title, List<String> tags, ContentGovernance governance);
}
