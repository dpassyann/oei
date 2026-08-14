package global.oei.domain.shared.content;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A member-proposed Markdown patch on a {@link Content} (never a direct edit of published
 * text). Read-only in this iteration: {@code listAdminContentContributions} is real and
 * DB-backed, but the member-facing write path ({@code createContribution}, tag
 * {@code member-contributions}) is not implemented yet — documented TODO — so this table is
 * legitimately empty until that slice lands, not silently faked.
 */
public record ContentContribution(
        String id, String contentId, String patch, MemberId authorMemberId, ContentContributionStatus status, Instant createdAt) {

    public ContentContribution {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(contentId, "contentId must not be null");
        Objects.requireNonNull(patch, "patch must not be null");
        Objects.requireNonNull(authorMemberId, "authorMemberId must not be null");
        Objects.requireNonNull(status, "status must not be null");
        Objects.requireNonNull(createdAt, "createdAt must not be null");
    }
}
