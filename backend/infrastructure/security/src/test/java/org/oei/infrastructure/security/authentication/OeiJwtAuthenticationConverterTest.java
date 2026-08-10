package org.oei.infrastructure.security.authentication;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;

import org.oei.infrastructure.security.properties.OeiSecurityProperties;

class OeiJwtAuthenticationConverterTest {

    private final OeiSecurityProperties properties = new OeiSecurityProperties();
    private final OeiJwtAuthenticationConverter converter = new OeiJwtAuthenticationConverter(properties);

    @Test
    void convert_mapsRealmRolesToPrefixedAuthorities() {
        final Jwt jwt = jwtWithRealmRoles("member", "member-gold");

        final AbstractAuthenticationToken token = converter.convert(jwt);

        assertThat(token.getAuthorities())
                .extracting(Object::toString)
                .containsExactlyInAnyOrder("ROLE_member", "ROLE_member-gold");
    }

    @Test
    void convert_returnsNoAuthoritiesWhenRealmAccessClaimMissing() {
        final Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject("sub-1")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .build();

        final AbstractAuthenticationToken token = converter.convert(jwt);

        assertThat(token.getAuthorities()).isEmpty();
    }

    @Test
    void extractRoles_ignoresNonStringEntries() {
        final Jwt jwt = jwtWithClaims(Map.of("realm_access", Map.of("roles", java.util.List.of("member", 42))));

        assertThat(converter.extractRoles(jwt)).containsExactly("member");
    }

    private Jwt jwtWithRealmRoles(final String... roles) {
        return jwtWithClaims(Map.of("realm_access", Map.of("roles", java.util.List.of(roles))));
    }

    private Jwt jwtWithClaims(final Map<String, Object> extraClaims) {
        final Jwt.Builder builder = Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject("sub-1")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60));
        extraClaims.forEach(builder::claim);
        return builder.build();
    }
}
