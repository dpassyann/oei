package global.oei.domain.core.publicprofile;

import java.time.Instant;
import java.util.List;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.publicprofile.PublicProfile;
import global.oei.domain.shared.publicprofile.PublicProfilePort;
import global.oei.domain.shared.publicprofile.PublishPublicProfileUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Enforces the publication invariant on {@link PublicProfile}: {@link PublicProfile#publishedAt()}
 * is set once, on the very first publication, and never changes on subsequent republications
 * (updating the slug/visible fields/SEO description does not reset "since when" the profile has
 * been public); {@link PublicProfile#viewsCount()} is likewise preserved across republications,
 * never reset to zero.
 */
@Slf4j
@RequiredArgsConstructor
public class PublishPublicProfileService implements PublishPublicProfileUseCase {

    @NonNull
    private final PublicProfilePort publicProfilePort;

    @Override
    public PublicProfile execute(
            final MemberId memberId, final String publicSlug, final List<String> visibleFields, final String seoDescription) {
        log.debug("PublishPublicProfileService: execute called");
        final PublicProfile existing = publicProfilePort.findByMemberId(memberId);
        final Instant publishedAt = existing.isPublished() ? existing.publishedAt() : Instant.now();
        final PublicProfile updated = new PublicProfile(memberId, publicSlug, visibleFields, seoDescription, publishedAt, existing.viewsCount());
        return publicProfilePort.save(updated);
    }
}
