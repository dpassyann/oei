package global.oei.domain.shared.publicprofile;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.MembershipTier;

/**
 * Generates (or refreshes) a member's {@link DigitalBusinessCard}.
 */
public interface GenerateDigitalBusinessCardUseCase {

    DigitalBusinessCard execute(MemberId memberId, String publicSlug, MembershipTier tier);
}
