package global.oei.domain.shared.publicprofile;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link PublicProfile}.
 *
 * <p>{@link #findByMemberId(MemberId)} never returns {@code null}/empty: if the member has
 * never published a profile, the adapter synthesizes an unpublished default (seeded from the
 * member's registration-time {@code publicSlug}) rather than forcing every caller to handle
 * absence — there is always "some" public profile settings view for an authenticated member,
 * even before their first publication.</p>
 */
public interface PublicProfilePort {

    PublicProfile findByMemberId(MemberId memberId);

    PublicProfile save(PublicProfile profile);
}
