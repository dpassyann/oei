package global.oei.infrastructure.persistence.config.audit;

import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Enables Spring Data JPA auditing ({@link BaseAudit} population) and resolves the current
 * auditor from Spring Security when a request is authenticated, falling back to a
 * {@code "system"} actor for batch/unauthenticated contexts (e.g. Liquibase-driven seed
 * data, scheduled jobs).
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "oeiAuditorAware")
public class PersistenceAuditingConfiguration {

    @Bean
    public AuditorAware<String> oeiAuditorAware() {
        return () -> {
            final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return Optional.of("system");
            }
            return Optional.ofNullable(authentication.getName()).or(() -> Optional.of("system"));
        };
    }
}
