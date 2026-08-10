package global.oei.application.web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import global.oei.domain.core.identity.GetMyIdentityUseCase;
import global.oei.domain.shared.security.SecurityContextPort;

/**
 * Executable composition root of the OEI backend.
 *
 * <p>Deliberate architecture choice (see the spring-boot-ddd-backend skill's "Composition
 * root rule"): {@code application-web} is the primary HTTP adapter <em>and</em> the
 * composition root — there is no separate {@code application/runtime} module. This module
 * is therefore the only one allowed to depend on {@code domain-core} (use case
 * implementations) in addition to {@code domain-shared}; it wires use cases with
 * infrastructure adapters as beans here.</p>
 */
@SpringBootApplication
@ComponentScan(basePackages = "global.oei")
@EntityScan(basePackages = "global.oei.infrastructure.persistence")
@EnableJpaRepositories(basePackages = "global.oei.infrastructure.persistence")
public class OeiBackendApplication {

    public static void main(final String[] args) {
        SpringApplication.run(OeiBackendApplication.class, args);
    }

    @Bean
    public GetMyIdentityUseCase getMyIdentityUseCase(final SecurityContextPort securityContextPort) {
        return new GetMyIdentityUseCase(securityContextPort);
    }
}
