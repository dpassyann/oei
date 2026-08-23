package global.oei.application.web.resource.member.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.resource.member.adapter.ProfileImportAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.ImportLinkedinBasicUseCase;
import global.oei.domain.shared.profile.LinkedinAuthorizationPort;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

/**
 * Implements LinkedIn basic import orchestration for member-profile-import endpoints.
 */
@Service
@RequiredArgsConstructor
public class ProfileImportService implements ProfileImportAdapter {

    private final SecurityContextPort securityContextPort;
    private final LinkedinAuthorizationPort linkedinAuthorizationPort;
    private final ImportLinkedinBasicUseCase importLinkedinBasicUseCase;

    @Override
    public ProfessionalProfile importLinkedinBasic(final String accessToken) {
        return importLinkedinBasicUseCase.execute(currentMemberId(), accessToken);
    }

    @Override
    public ProfessionalProfile importLinkedinBasicWithAuthorizationCode(
            final String authorizationCode,
            final String redirectUri) {
        final String accessToken = linkedinAuthorizationPort.exchangeAuthorizationCode(authorizationCode, redirectUri);
        return importLinkedinBasicUseCase.execute(currentMemberId(), accessToken);
    }

    private MemberId currentMemberId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return MemberId.of(identity.subject());
    }
}

