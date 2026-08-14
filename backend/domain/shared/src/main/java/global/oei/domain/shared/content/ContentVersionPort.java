package global.oei.domain.shared.content;

import java.util.List;
import java.util.Optional;

public interface ContentVersionPort {

    ContentVersion save(ContentVersion version);

    Optional<ContentVersion> findById(String id);

    List<ContentVersion> findByContentId(String contentId);
}
