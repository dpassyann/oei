package global.oei.infrastructure.wiring;

import java.util.Optional;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

/**
 * Minimal bootable application, test-only: {@link OeiWiringConfigurationTest} uses this to
 * boot the real composition root ({@link OeiWiringConfiguration}) against a real Postgres
 * (Testcontainers) without needing the full {@code application-web} module. Since this test
 * app has no servlet stack, {@code infrastructure-security}'s
 * {@code OeiSecurityAutoConfiguration} (which is {@code @ConditionalOnWebApplication}) never
 * activates — a trivial {@link SecurityContextPort} stub stands in for it, since this test
 * only cares about wiring completeness, not authentication behavior itself.
 */
@SpringBootConfiguration
@EnableAutoConfiguration
@Import(OeiWiringConfiguration.class)
class OeiWiringConfigurationTestApp {

    @Bean
    SecurityContextPort securityContextPort() {
        return () -> Optional.<AuthenticatedIdentity>empty();
    }
}
