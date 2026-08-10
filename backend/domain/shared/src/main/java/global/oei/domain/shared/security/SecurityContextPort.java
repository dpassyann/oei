package global.oei.domain.shared.security;

import java.util.Optional;

/**
 * Outbound port exposing the identity of the currently authenticated caller to the
 * domain, without the domain ever referencing Spring Security types.
 *
 * <p>Implemented in {@code infrastructure-security} by reading the current
 * {@code Authentication}/{@code Jwt} and translating it into an
 * {@link AuthenticatedIdentity}.</p>
 */
public interface SecurityContextPort {

    /**
     * @return the current caller's identity, or {@link Optional#empty()} when called
     *         outside of an authenticated request (e.g. batch/system context).
     */
    Optional<AuthenticatedIdentity> currentIdentity();
}
