package global.oei.domain.shared.content;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for {@link Content}. {@link #search} is a best-effort in-memory filter over
 * {@link #findAll()} in the current adapter (no dedicated indexes yet) — real and correct,
 * just not optimized for a large corpus; acceptable at this iteration's data volume.
 */
public interface ContentPort {

    Content save(Content content);

    Optional<Content> findById(String id);

    List<Content> findAll();

    List<Content> search(ContentType type, ContentWorkflowStatus status, String lang, String tag, String q);
}
