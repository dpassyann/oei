package global.oei.domain.core.identity;

import java.util.Objects;
import java.util.Optional;

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
public class GetMyIdentityService implements GetMyIdentityUseCase {

    private final SecurityContextPort securityContextPort;

    public GetMyIdentityService(final SecurityContextPort securityContextPort) {
        this.securityContextPort = Objects.requireNonNull(securityContextPort, "securityContextPort must not be null");
    }

    @Override
    public Optional<AuthenticatedIdentity> execute() {
        return securityContextPort.currentIdentity();
    }
}
