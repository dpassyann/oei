package global.oei.acceptance;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

/**
 * Test-only replacement for the real Keycloak-backed {@code JwtDecoder}
 * ({@code infrastructure-security}'s {@code OeiSecurityAutoConfiguration} normally resolves
 * one from {@code spring.security.oauth2.resourceserver.jwt.issuer-uri}, which requires a
 * real, reachable Keycloak realm — not available in this acceptance-test environment).
 *
 * <p>Accepts any bearer token of the form {@code subject.role1,role2} verbatim (no signature
 * validation) and decodes it into a {@link Jwt} carrying that subject and those realm roles
 * — the same claim shape {@code OeiJwtAuthenticationConverter} reads in production. Scenario
 * steps build such a token directly (see {@code AcceptanceTestTokens}), matching real demo
 * member ids so the resulting {@code MemberId} resolves to real seeded data.</p>
 */
@TestConfiguration
public class AcceptanceTestSecurityConfig {

    @Bean
    public JwtDecoder jwtDecoder() {
        return token -> {
            final String[] parts = token.split("\\.", 2);
            final String subject = parts[0];
            final List<String> roles = parts.length > 1 ? Arrays.asList(parts[1].split(",")) : List.of();
            final Instant now = Instant.now();
            return Jwt.withTokenValue(token)
                    .header("alg", "none")
                    .subject(subject)
                    .issuedAt(now)
                    .expiresAt(now.plusSeconds(3600))
                    .claim("realm_access", Map.of("roles", roles))
                    .build();
        };
    }
}
