package global.oei.application.web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Import;

import global.oei.application.web.config.WebResourcesConfiguration;
import global.oei.infrastructure.wiring.OeiWiringConfiguration;

/**
 * Executable entry point of the OEI backend.
 *
 * <p>Deliberately composed from {@link SpringBootConfiguration} + {@link EnableAutoConfiguration}
 * instead of the {@code @SpringBootApplication} meta-annotation, specifically to avoid the
 * implicit {@code @ComponentScan} that {@code @SpringBootApplication} carries — this project
 * wires every bean explicitly (predictability + AOT/native-image friendliness; see the
 * spring-boot-ddd-backend skill's "Explicit wiring" rule). All application configuration is
 * pulled in via explicit {@link Import}:</p>
 * <ul>
 *   <li>{@link OeiWiringConfiguration} (in {@code infrastructure-wiring}) — the composition
 *       root that exposes {@code domain-core} use cases as {@code domain-shared}
 *       interfaces, and wires the JPA/security infrastructure adapters;</li>
 *   <li>{@link WebResourcesConfiguration} — this module's own {@code *Resource}/
 *       {@code *Adapter}/{@code service.*Service} wiring.</li>
 * </ul>
 * {@code @EnableAutoConfiguration} still loads Spring Boot auto-configuration classes (e.g.
 * {@code OeiSecurityAutoConfiguration}) via their {@code AutoConfiguration.imports} file —
 * that is a Spring Boot core mechanism, not classpath component scanning.
 */
@SpringBootConfiguration
@EnableAutoConfiguration
@Import({OeiWiringConfiguration.class, WebResourcesConfiguration.class})
public class OeiBackendApplication {

    public static void main(final String[] args) {
        SpringApplication.run(OeiBackendApplication.class, args);
    }
}
