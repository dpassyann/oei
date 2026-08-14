package global.oei.domain.shared.content;

import java.time.Instant;
import java.util.Objects;

public record ContentPublication(String id, String contentVersionId, Instant publishedAt, String publishedBy, String channel) {

    public ContentPublication {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(contentVersionId, "contentVersionId must not be null");
        Objects.requireNonNull(publishedAt, "publishedAt must not be null");
    }
}
