package global.oei.domain.core.content;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentVersion;
import global.oei.domain.shared.content.ContentVersionPort;
import global.oei.domain.shared.content.ContentWorkflowStatus;
import global.oei.domain.shared.content.CreateContentVersionUseCase;

public class CreateContentVersionService implements CreateContentVersionUseCase {

    private final ContentPort contentPort;
    private final ContentVersionPort contentVersionPort;

    public CreateContentVersionService(final ContentPort contentPort, final ContentVersionPort contentVersionPort) {
        this.contentPort = Objects.requireNonNull(contentPort, "contentPort must not be null");
        this.contentVersionPort = Objects.requireNonNull(contentVersionPort, "contentVersionPort must not be null");
    }

    @Override
    public ContentVersion execute(
            final String contentId, final String language, final String title, final String body, final Map<String, Object> frontMatter,
            final String authorId) {
        final Content content =
                contentPort.findById(contentId).orElseThrow(() -> new NoSuchElementException("content not found: " + contentId));
        final int nextVersionNumber = contentVersionPort.findByContentId(contentId).size() + 1;
        final ContentVersion version = contentVersionPort.save(new ContentVersion(
                UUID.randomUUID().toString(), contentId, "v" + nextVersionNumber, language, title, body, frontMatter,
                List.of(authorId), ContentWorkflowStatus.DRAFT, Instant.now()));
        contentPort.save(content.withNewVersion(version.id()));
        return version;
    }
}
