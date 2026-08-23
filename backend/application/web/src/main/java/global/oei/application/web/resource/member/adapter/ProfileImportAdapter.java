package global.oei.application.web.resource.member.adapter;

import global.oei.domain.shared.profile.ProfessionalProfile;

/**
 * Application adapter for profile-import orchestration endpoints.
 */
public interface ProfileImportAdapter {

    ProfessionalProfile importLinkedinBasic(String accessToken);

    ProfessionalProfile importLinkedinBasicWithAuthorizationCode(String authorizationCode, String redirectUri);
}

