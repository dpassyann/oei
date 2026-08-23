package global.oei.domain.shared.profile;

import global.oei.domain.shared.member.MemberId;

/**
 * Imports LinkedIn basic identity for the authenticated member and updates onboarding source.
 */
public interface ImportLinkedinBasicUseCase {

    ProfessionalProfile execute(MemberId memberId, String accessToken);
}

