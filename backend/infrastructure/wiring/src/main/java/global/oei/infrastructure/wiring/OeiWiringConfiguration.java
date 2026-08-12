package global.oei.infrastructure.wiring;

import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import global.oei.domain.core.identity.GetMyIdentityService;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.security.GetMyIdentityUseCase;
import global.oei.domain.shared.security.SecurityContextPort;
import global.oei.infrastructure.persistence.config.audit.PersistenceAuditingConfiguration;
import global.oei.infrastructure.persistence.membership.MembershipPersistenceAdapter;
import global.oei.infrastructure.persistence.membership.MembershipRepository;

/**
 * Composition root of the OEI backend.
 *
 * <p>This is the sole class in the project — outside {@code domain-core} itself — allowed
 * to import concrete {@code domain-core} types. Every {@code @Bean} method here returns a
 * {@code domain-shared} interface (an inbound use case or an outbound port), constructed
 * from a concrete {@code domain-core} implementation wired with outbound port adapters
 * provided by {@code infrastructure-security}/{@code infrastructure-persistence}.
 * {@code application-web} (and any future primary adapter) therefore never needs to
 * reference {@code domain-core} directly — it consumes the interfaces exposed here.</p>
 *
 * <p><b>No classpath component scanning</b> (see the spring-boot-ddd-backend skill's
 * "Explicit wiring" rule): every adapter bean below is instantiated explicitly. The two
 * exceptions are structural requirements of the underlying mechanism, not application
 * component scanning, and are declared explicitly with a narrow {@code basePackages}:</p>
 * <ul>
 *   <li>{@link EnableJpaRepositories} — Spring Data JPA can only generate repository proxy
 *       beans for {@code interface}s it discovers under the given base package; there is no
 *       {@code @Bean}-based equivalent for repository proxy generation.</li>
 *   <li>{@link EntityScan} — the JPA persistence unit needs to know which packages contain
 *       {@code @Entity} classes; again a structural requirement, not a component scan.</li>
 * </ul>
 * {@link PersistenceAuditingConfiguration} itself is a plain {@code @Configuration} with
 * explicit {@code @Bean} methods, so it is pulled in via {@code @Import} rather than scanned.
 */
@Configuration(proxyBeanMethods = false)
@Import(PersistenceAuditingConfiguration.class)
@EnableJpaRepositories(basePackages = "global.oei.infrastructure.persistence")
@EntityScan(basePackages = "global.oei.infrastructure.persistence")
public class OeiWiringConfiguration {

    @Bean
    public GetMyIdentityUseCase getMyIdentityUseCase(final SecurityContextPort securityContextPort) {
        return new GetMyIdentityService(securityContextPort);
    }

    @Bean
    public MembershipLookupPort membershipLookupPort(final MembershipRepository membershipRepository) {
        return new MembershipPersistenceAdapter(membershipRepository);
    }
}
