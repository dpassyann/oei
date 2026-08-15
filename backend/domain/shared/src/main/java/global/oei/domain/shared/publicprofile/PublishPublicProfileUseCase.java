package global.oei.domain.shared.publicprofile;

import java.util.List;

import global.oei.domain.shared.member.MemberId;

/**
 * Publishes or updates a member's public profile (custom slug, per-field visibility, SEO
 * description).
 */
public interface PublishPublicProfileUseCase {

    PublicProfile execute(MemberId memberId, String publicSlug, List<String> visibleFields, String seoDescription);
}
