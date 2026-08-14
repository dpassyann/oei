package global.oei.domain.core.content;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentGovernance;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentSourceType;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentWorkflowStatus;
import global.oei.domain.shared.content.CreateContentUseCase;

/**
 * Enforces the "always starts DRAFT, no current version yet" invariant on every newly
 * created {@link Content} — the first real version is only created by a subsequent
 * {@code updateAdminContent} call (see {@code CreateContentVersionService}).
 */
public class CreateContentService implements CreateContentUseCase {

    private final ContentPort contentPort;

    public CreateContentService(final ContentPort contentPort) {
        this.contentPort = Objects.requireNonNull(contentPort, "contentPort must not be null");
    }

    @Override
    public Content execute(
            final ContentType type, final String slug, final ContentSourceType sourceType, final String title, final List<String> tags,
            final ContentGovernance governance) {
        final Content content = new Content(
                UUID.randomUUID().toString(), type, slug, sourceType, title, tags, governance, null, ContentWorkflowStatus.DRAFT);
        return contentPort.save(content);
    }
}
