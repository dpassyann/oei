package global.oei.domain.shared.content;

import java.util.Map;

/**
 * Inbound port: create a brand-new {@link ContentVersion} for an existing {@link Content},
 * never overwriting a previous (possibly published) version — see {@link Content}'s Javadoc.
 * Resets the parent {@link Content} back to {@link ContentWorkflowStatus#DRAFT}.
 */
public interface CreateContentVersionUseCase {

    ContentVersion execute(
            String contentId, String language, String title, String body, Map<String, Object> frontMatter, String authorId);
}
