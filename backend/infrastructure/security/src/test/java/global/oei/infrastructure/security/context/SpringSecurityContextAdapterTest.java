package global.oei.infrastructure.security.context;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

class SpringSecurityContextAdapterTest {

    private final SpringSecurityContextAdapter adapter = new SpringSecurityContextAdapter();

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void currentIdentity_resolvesInstitutionIdFromGroupsClaimWhenDirectClaimMissing() {
        final Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject("sub-1")
                .claim("groups", List.of("/institutions/demo-institution"))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt));

        final String institutionId = adapter.currentIdentity().orElseThrow().institutionId();

        assertThat(institutionId).isEqualTo("demo-institution");
    }

    @Test
    void currentIdentity_prefersDirectInstitutionIdClaimOverGroupsClaim() {
        final Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject("sub-1")
                .claim("institutionId", "direct-id")
                .claim("groups", List.of("/institutions/group-id"))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt));

        final String institutionId = adapter.currentIdentity().orElseThrow().institutionId();

        assertThat(institutionId).isEqualTo("direct-id");
    }

    @Test
    void currentIdentity_returnsEmptyWhenAuthenticationIsNotJwt() {
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken("user", "pwd"));

        assertThat(adapter.currentIdentity()).isEmpty();
    }
}

