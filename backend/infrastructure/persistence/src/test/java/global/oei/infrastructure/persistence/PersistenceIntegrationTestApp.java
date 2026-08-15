package global.oei.infrastructure.persistence;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import global.oei.infrastructure.persistence.config.audit.PersistenceAuditingConfiguration;

/**
 * Minimal bootable application, test-only: every {@code *PersistenceAdapter} integration
 * test in this module boots this against a real Testcontainers Postgres (never H2) with the
 * real Liquibase changelog applied, then constructs the adapter under test directly (never
 * as a Spring bean — these adapters have no {@code @Component} stereotype of their own, they
 * are wired explicitly by {@code infrastructure-wiring}'s composition root in production).
 * {@link PersistenceAuditingConfiguration} is imported since every {@code BaseAudit}-based
 * entity needs {@code created_at}/{@code last_modified_at} populated to satisfy their
 * {@code NOT NULL} schema columns.
 */
@SpringBootConfiguration
@EnableAutoConfiguration
@EnableJpaRepositories(basePackages = "global.oei.infrastructure.persistence")
@EntityScan(basePackages = "global.oei.infrastructure.persistence")
@Import(PersistenceAuditingConfiguration.class)
public class PersistenceIntegrationTestApp {
}
