package global.oei.domain.core.content;

import java.util.List;
import java.util.UUID;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
@Slf4j
@RequiredArgsConstructor
public class CreateContentService implements CreateContentUseCase {

    @NonNull
    private final ContentPort contentPort;

    @Override
    public Content execute(
            final ContentType type, final String slug, final ContentSourceType sourceType, final String title, final List<String> tags,
            final ContentGovernance governance) {
        log.debug("CreateContentService: execute called");
        final Content content = new Content(
                UUID.randomUUID().toString(), type, slug, sourceType, title, tags, governance, null, ContentWorkflowStatus.DRAFT);
        return contentPort.save(content);
    }
}
