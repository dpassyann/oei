package global.oei.infrastructure.security.authentication;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import global.oei.infrastructure.security.properties.OeiSecurityProperties;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

/**
 * Converts a validated Keycloak {@link Jwt} into a {@link JwtAuthenticationToken}, mapping
 * the realm roles found under {@code realm_access.roles} into Spring Security authorities
 * prefixed with {@code ROLE_}.
 *
 * <p>Realm roles are already human-readable strings for the {@code oei} realm
 * ({@code member}, {@code admin}, {@code member-<tier>}, {@code institution-<function>}) —
 * see {@code docs/architecture/keycloak-roles.md}. No PUID/tenant decoding is needed, unlike
 * the IAP starter this module takes inspiration from.</p>
 */
@RequiredArgsConstructor
public class OeiJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @NonNull
    private final OeiSecurityProperties properties;

    @Override
    public AbstractAuthenticationToken convert(final @org.jspecify.annotations.NonNull Jwt jwt) {
        final Collection<SimpleGrantedAuthority> authorities = extractRoles(jwt).stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
        return new JwtAuthenticationToken(jwt, authorities);
    }

    /**
     * Reads the raw realm roles from the claim path configured via
     * {@code oei.security.roles-claim} (defaults to Keycloak's {@code realm_access.roles}).
     */
    Set<String> extractRoles(final Jwt jwt) {
        final String[] path = properties.getRolesClaim().split("\\.");
        Object current = jwt.getClaims();
        for (final String segment : path) {
            if (!(current instanceof Map<?, ?> map)) {
                return Set.of();
            }
            current = map.get(segment);
        }
        if (current instanceof Collection<?> roles) {
            return roles.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .collect(Collectors.toUnmodifiableSet());
        }
        return Set.of();
    }
}
