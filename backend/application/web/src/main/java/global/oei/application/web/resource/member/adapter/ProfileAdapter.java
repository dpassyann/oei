package global.oei.application.web.resource.member.adapter;

import global.oei.domain.shared.profile.ProfessionalProfile;

/**
 * Adapter interface between the profile domain's {@code *Resource} classes and the domain.
 * See {@code MembershipAdapter} (resource.member.adapter) for the project-wide convention
 * this mirrors.
 */
public interface ProfileAdapter {

    ProfessionalProfile getMyProfile();

    ProfessionalProfile updateMyProfile(ProfessionalProfile profile);
}
