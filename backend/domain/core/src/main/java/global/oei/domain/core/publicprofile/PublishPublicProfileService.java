package global.oei.domain.core.publicprofile;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.publicprofile.PublicProfile;
import global.oei.domain.shared.publicprofile.PublicProfilePort;
import global.oei.domain.shared.publicprofile.PublishPublicProfileUseCase;

/**
 * Enforces the publication invariant on {@link PublicProfile}: {@link PublicProfile#publishedAt()}
 * is set once, on the very first publication, and never changes on subsequent republications
 * (updating the slug/visible fields/SEO description does not reset "since when" the profile has
 * been public); {@link PublicProfile#viewsCount()} is likewise preserved across republications,
 * never reset to zero.
 */
public class PublishPublicProfileService implements PublishPublicProfileUseCase {

    private final PublicProfilePort publicProfilePort;

    public PublishPublicProfileService(final PublicProfilePort publicProfilePort) {
        this.publicProfilePort = Objects.requireNonNull(publicProfilePort, "publicProfilePort must not be null");
    }

    @Override
    public PublicProfile execute(
            final MemberId memberId, final String publicSlug, final List<String> visibleFields, final String seoDescription) {
        final PublicProfile existing = publicProfilePort.findByMemberId(memberId);
        final Instant publishedAt = existing.isPublished() ? existing.publishedAt() : Instant.now();
        final PublicProfile updated = new PublicProfile(memberId, publicSlug, visibleFields, seoDescription, publishedAt, existing.viewsCount());
        return publicProfilePort.save(updated);
    }
}
