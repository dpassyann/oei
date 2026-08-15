package global.oei.domain.shared.badge;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: manually award an official OEI badge to a member (admin action, always
 * {@link BadgeAwardSource#MANUAL} — see {@code CreateInstitutionBadgeProposal} for the
 * institution-proposal path, out of this operation's scope).
 */
public interface AwardBadgeUseCase {

    BadgeAward execute(MemberId memberId, String badgeId, String awardedBy);
}
