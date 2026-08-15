package global.oei.domain.shared.publicprofile;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A member's public profile settings: which fields of their professional profile are exposed
 * on their public page ({@code /membre/{publicSlug}}), the custom SEO description, and view
 * statistics.
 *
 * <p>Before a member ever calls {@code publishPublicProfile}, {@code PublicProfilePort}
 * synthesizes a not-yet-published default (see its Javadoc) — {@link #publishedAt()} is
 * {@code null} and {@link #visibleFields()} empty until the first publication.</p>
 */
public record PublicProfile(
        MemberId memberId, String publicSlug, List<String> visibleFields, String seoDescription, Instant publishedAt, int viewsCount) {

    public PublicProfile {
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(publicSlug, "publicSlug must not be null");
        Objects.requireNonNull(visibleFields, "visibleFields must not be null");
        visibleFields = List.copyOf(visibleFields);
        if (viewsCount < 0) {
            throw new IllegalArgumentException("viewsCount must not be negative");
        }
    }

    /**
     * Whether this profile has ever been published.
     */
    public boolean isPublished() {
        return publishedAt != null;
    }
}
