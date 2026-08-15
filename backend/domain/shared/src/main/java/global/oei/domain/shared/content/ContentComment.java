package global.oei.domain.shared.content;

import java.time.Instant;
import java.util.Objects;

/**
 * A comment on either a {@link ContentContribution} (consultation discussion) or directly on a
 * published {@link Content}. Exactly one of {@link #contributionId()}/{@link #contentId()} is
 * expected to be set in practice (enforced by the calling use case, not this record, since the
 * OpenAPI contract itself models both as independently nullable).
 *
 * @param authorId either a member id or an admin/staff id — kept as a plain {@code String}
 *                  rather than {@link global.oei.domain.shared.member.MemberId} since staff
 *                  authors are not members
 */
public record ContentComment(String id, String contributionId, String contentId, String authorId, String body, Instant createdAt) {

    public ContentComment {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(authorId, "authorId must not be null");
        Objects.requireNonNull(body, "body must not be null");
        Objects.requireNonNull(createdAt, "createdAt must not be null");
        if (body.isBlank()) {
            throw new IllegalArgumentException("body must not be blank");
        }
    }
}
