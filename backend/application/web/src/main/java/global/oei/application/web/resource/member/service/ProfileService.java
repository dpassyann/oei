package global.oei.application.web.resource.member.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.member.adapter.ProfileAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.GetMyProfileUseCase;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.UpdateMyProfileUseCase;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implements {@link ProfileAdapter} by resolving the current caller's identity via
 * {@link SecurityContextPort} and delegating to {@link GetMyProfileUseCase}/
 * {@link UpdateMyProfileUseCase} — all {@code domain-shared} interfaces, resolved to
 * concrete beans by {@code infrastructure-wiring}'s {@code OeiWiringConfiguration}.
 *
 * <p>{@code @Service} + Lombok {@code @RequiredArgsConstructor}: discovered by
 * {@code OeiBackendApplication}'s own {@code @SpringBootApplication} component scan, not
 * registered via a hand-written {@code @Bean} method.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService implements ProfileAdapter {

    private final SecurityContextPort securityContextPort;
    private final GetMyProfileUseCase getMyProfileUseCase;
    private final UpdateMyProfileUseCase updateMyProfileUseCase;

    @Override
    public ProfessionalProfile getMyProfile() {
        return getMyProfileUseCase.execute(currentMemberId());
    }

    @Override
    public ProfessionalProfile updateMyProfile(final ProfessionalProfile profile) {
        return updateMyProfileUseCase.execute(profile.withMemberId(currentMemberId()));
    }

    private MemberId currentMemberId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return MemberId.of(identity.subject());
    }
}
