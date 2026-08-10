package global.oei.infrastructure.security.context;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

/**
 * Spring Security implementation of {@link SecurityContextPort}: reads the current
 * {@link Authentication} and, when it is a {@link JwtAuthenticationToken} issued by the
 * OEI Keycloak realm, translates it into a framework-agnostic {@link AuthenticatedIdentity}.
 *
 * <p>This is the one place in the codebase allowed to know both Spring Security types and
 * the domain identity contract — the domain itself never imports Spring Security.</p>
 */
public class SpringSecurityContextAdapter implements SecurityContextPort {

    @Override
    public Optional<AuthenticatedIdentity> currentIdentity() {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)) {
            return Optional.empty();
        }

        final Jwt jwt = jwtAuthentication.getToken();
        final Set<String> roles = jwtAuthentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .map(authority -> authority.startsWith("ROLE_") ? authority.substring("ROLE_".length()) : authority)
                .collect(Collectors.toUnmodifiableSet());

        return Optional.of(new AuthenticatedIdentity(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("name"),
                roles));
    }
}
