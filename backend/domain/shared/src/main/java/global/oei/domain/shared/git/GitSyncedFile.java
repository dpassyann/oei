package global.oei.domain.shared.git;

import java.util.Objects;

/**
 * One Markdown file (with front matter) fetched by a {@link GitSynchronization}.
 */
public record GitSyncedFile(String synchronizationId, String path, String gitRef, String commitSha, String rawContent) {

    public GitSyncedFile {
        Objects.requireNonNull(synchronizationId, "synchronizationId must not be null");
        Objects.requireNonNull(path, "path must not be null");
        Objects.requireNonNull(gitRef, "gitRef must not be null");
        Objects.requireNonNull(commitSha, "commitSha must not be null");
        Objects.requireNonNull(rawContent, "rawContent must not be null");
    }
}
