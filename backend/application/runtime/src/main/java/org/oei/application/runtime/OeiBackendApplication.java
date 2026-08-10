package org.oei.application.runtime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

import org.oei.domain.core.identity.GetMyIdentityUseCase;
import org.oei.domain.shared.security.SecurityContextPort;

/**
 * Executable composition root of the OEI backend.
 *
 * <p>This is the only module allowed to know both {@code domain-core} (use case
 * implementations) and the infrastructure adapters; it wires them together as beans.
 * {@code application-web} controllers depend on the use cases through constructor
 * injection, never on infrastructure directly.</p>
 */
@SpringBootApplication
@ComponentScan(basePackages = "org.oei")
public class OeiBackendApplication {

    public static void main(final String[] args) {
        SpringApplication.run(OeiBackendApplication.class, args);
    }

    @Bean
    public GetMyIdentityUseCase getMyIdentityUseCase(final SecurityContextPort securityContextPort) {
        return new GetMyIdentityUseCase(securityContextPort);
    }
}
