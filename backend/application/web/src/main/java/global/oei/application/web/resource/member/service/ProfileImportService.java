package global.oei.application.web.resource.member.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.resource.member.adapter.ProfileImportAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.ImportLinkedinBasicUseCase;
import global.oei.domain.shared.profile.LinkedinAuthorizationPort;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profileimport.InitiateProfileImportUseCase;
import global.oei.domain.shared.profileimport.ProfileImport;
import global.oei.domain.shared.profileimport.ProfileImportPort;
import global.oei.domain.shared.profileimport.ProfileImportSource;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

/**
 * Implements LinkedIn basic import and Smart CV Import orchestration for member-profile-import
 * endpoints.
 */
@Service
@RequiredArgsConstructor
public class ProfileImportService implements ProfileImportAdapter {

    private final SecurityContextPort securityContextPort;
    private final LinkedinAuthorizationPort linkedinAuthorizationPort;
    private final ImportLinkedinBasicUseCase importLinkedinBasicUseCase;
    private final ProfileImportPort profileImportPort;
    private final InitiateProfileImportUseCase initiateProfileImportUseCase;

    @Override
    public ProfessionalProfile importLinkedinBasicWithAuthorizationCode(
            final String authorizationCode,
            final String redirectUri) {
        final String accessToken = linkedinAuthorizationPort.exchangeAuthorizationCode(authorizationCode, redirectUri);
        return importLinkedinBasicUseCase.execute(currentMemberId(), accessToken);
    }

    @Override
    public ProfileImport initiateFromCv(final ProfileImportSource source) {
        return initiateProfileImportUseCase.execute(currentMemberId(), source);
    }

    @Override
    public Optional<ProfileImport> getMyProfileImport(final String importId) {
        final MemberId memberId = currentMemberId();
        return profileImportPort.findById(importId).filter(session -> session.memberId().equals(memberId));
    }

    private MemberId currentMemberId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return MemberId.of(identity.subject());
    }
}

