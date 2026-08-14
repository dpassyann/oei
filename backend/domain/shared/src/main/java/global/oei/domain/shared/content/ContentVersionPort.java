package global.oei.domain.shared.content;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for {@link ContentVersion}.
 */
public interface ContentVersionPort {

    ContentVersion save(ContentVersion version);

    Optional<ContentVersion> findById(String id);

    List<ContentVersion> findByContentId(String contentId);
}
