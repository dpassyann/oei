package global.oei.domain.shared.security;

import java.util.Optional;

/**
 * Inbound port: resolve the identity of whoever is calling right now.
 *
 * <p>Implemented in {@code domain-core} ({@code GetMyIdentityService}), wired as a bean by
 * the {@code infrastructure} composition root, and consumed through this interface only —
 * callers never reference the concrete {@code domain-core} implementation.</p>
 */
public interface GetMyIdentityUseCase {

    /**
     * @return the current caller's identity, or {@link Optional#empty()} when there is no
     *         authenticated caller (e.g. a public endpoint or a batch context).
     */
    Optional<AuthenticatedIdentity> execute();
}
