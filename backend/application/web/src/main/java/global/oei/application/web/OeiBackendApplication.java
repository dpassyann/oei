package global.oei.application.web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Import;

import global.oei.application.web.config.OeiLokiLoggingProperties;
import global.oei.infrastructure.wiring.OeiWiringConfiguration;

/**
 * Executable entry point of the OEI backend.
 *
 * <p>Uses the standard {@code @SpringBootApplication} meta-annotation, including its
 * implicit component scan. This is safe by construction: the scan is rooted at this class's
 * own package ({@code global.oei.application.web} and subpackages only) and therefore
 * cannot reach {@code domain-core}/{@code infrastructure-*}, which live in entirely
 * different package trees and Maven modules. It only ever discovers this module's own
 * {@code @RestController}/{@code @Service} classes under {@code resource.<domain>}.</p>
 *
 * <p>Cross-module/domain wiring stays explicit regardless: {@link OeiWiringConfiguration}
 * (in {@code infrastructure-wiring}) is the composition root that exposes {@code domain-core}
 * use cases as {@code domain-shared} interfaces and wires the JPA/security infrastructure
 * adapters — pulled in here via an explicit {@link Import}, never via component scanning.
 * See the spring-boot-ddd-backend skill's "Explicit wiring — scoped to cross-module/domain
 * boundaries only" rule.</p>
 */
@SpringBootApplication
@EnableConfigurationProperties(OeiLokiLoggingProperties.class)
@Import(OeiWiringConfiguration.class)
public class OeiBackendApplication {

    public static void main(final String[] args) {
        SpringApplication.run(OeiBackendApplication.class, args);
    }
}
