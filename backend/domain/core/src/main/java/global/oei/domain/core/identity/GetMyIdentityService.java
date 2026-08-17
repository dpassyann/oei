package global.oei.domain.core.identity;

import java.util.Optional;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.GetMyIdentityUseCase;
import global.oei.domain.shared.security.SecurityContextPort;

/**
 * Minimal use case proving the end-to-end wiring of {@link SecurityContextPort}:
 * resolve the identity of whoever is calling right now.
 *
 * <p>Not meant to be exhaustive — later use cases (profile, membership, entitlements)
 * will build on the same {@link SecurityContextPort} to resolve the acting
 * {@code MemberId} rather than duplicating this lookup.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class GetMyIdentityService implements GetMyIdentityUseCase {

    @NonNull
    private final SecurityContextPort securityContextPort;

    @Override
    public Optional<AuthenticatedIdentity> execute() {
        log.debug("GetMyIdentityService: execute called");
        return securityContextPort.currentIdentity();
    }
}
