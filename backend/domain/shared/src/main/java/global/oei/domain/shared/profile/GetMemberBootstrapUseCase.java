package global.oei.domain.shared.profile;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: resolve the bootstrap state for the current authenticated member.
 *
 * <p>Called once by the frontend immediately after authentication to determine the landing
 * experience. Must never return HTTP 500 for a missing profile — instead return
 * {@link ProfileStatus#ONBOARDING_REQUIRED}.</p>
 */
public interface GetMemberBootstrapUseCase {

    MemberBootstrap execute(MemberId memberId);
}

