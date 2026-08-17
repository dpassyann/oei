package global.oei.domain.core.content;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentVersion;
import global.oei.domain.shared.content.ContentVersionPort;
import global.oei.domain.shared.content.CreateContentVersionUseCase;

/**
 * Default {@code CreateContentVersionUseCase} implementation.
 */
@Slf4j
@RequiredArgsConstructor
public class CreateContentVersionService implements CreateContentVersionUseCase {

    @NonNull
    private final ContentPort contentPort;
    @NonNull
    private final ContentVersionPort contentVersionPort;

    @Override
    public ContentVersion execute(
            final String contentId, final String language, final String title, final String body, final Map<String, Object> frontMatter,
            final String authorId) {
        log.debug("CreateContentVersionService: execute called");
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
