package global.oei.application.web.resource.member.adapter;

import java.util.Optional;

import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profileimport.ProfileImport;
import global.oei.domain.shared.profileimport.ProfileImportSource;

/**
 * Application adapter for profile-import orchestration endpoints.
 */
public interface ProfileImportAdapter {

    ProfessionalProfile importLinkedinBasicWithAuthorizationCode(String authorizationCode, String redirectUri);

    /**
     * Initiates a new "Smart CV Import" session for the authenticated member from an
     * already-received document (see {@code InitiateProfileImportUseCase}'s Javadoc for why
     * the session starts at {@code DOCUMENT_UPLOADED} rather than {@code CREATED}).
     *
     * <p>This track implements the status machine and its plumbing only: no text-extraction
     * or AI adapter drives this session past {@code DOCUMENT_UPLOADED} yet.</p>
     */
    ProfileImport initiateFromCv(ProfileImportSource source);

    /**
     * @return the session, if it exists and belongs to the authenticated member
     */
    Optional<ProfileImport> getMyProfileImport(String importId);
}

