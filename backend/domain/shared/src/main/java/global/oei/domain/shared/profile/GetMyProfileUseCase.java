package global.oei.domain.shared.profile;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: resolve the current caller's {@link ProfessionalProfile}, defaulting to an
 * empty (0% complete) profile when the member has never saved one yet — a profile
 * conceptually always exists for a registered member, it just starts blank.
 */
public interface GetMyProfileUseCase {

    ProfessionalProfile execute(MemberId memberId);
}
