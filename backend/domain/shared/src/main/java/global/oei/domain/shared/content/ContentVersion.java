package global.oei.domain.shared.content;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * One versioned draft of a {@link Content}'s body — never overwritten in place, see {@link Content}'s Javadoc.
 */
public record ContentVersion(
        String id,
        String contentId,
        String version,
        String language,
        String title,
        String body,
        Map<String, Object> frontMatter,
        List<String> authorIds,
        ContentWorkflowStatus status,
        Instant createdAt) {

    public ContentVersion {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(contentId, "contentId must not be null");
        Objects.requireNonNull(version, "version must not be null");
        Objects.requireNonNull(language, "language must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(body, "body must not be null");
        Objects.requireNonNull(status, "status must not be null");
        frontMatter = frontMatter == null ? Map.of() : Map.copyOf(frontMatter);
        authorIds = List.copyOf(authorIds == null ? List.of() : authorIds);
    }

    public ContentVersion withStatus(final ContentWorkflowStatus newStatus) {
        return new ContentVersion(id, contentId, version, language, title, body, frontMatter, authorIds, newStatus, createdAt);
    }
}
