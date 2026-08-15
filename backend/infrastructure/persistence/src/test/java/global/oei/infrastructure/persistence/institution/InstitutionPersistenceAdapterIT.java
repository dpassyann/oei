package global.oei.infrastructure.persistence.institution;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import global.oei.domain.shared.institution.Institution;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied — including the {@code 0020-demo-institution} demo dataset. Asserts
 * both the {@code sectors_json} jsonb round-trip and the separate
 * {@code institution_domain} join.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class InstitutionPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private InstitutionRepository repository;

    @Autowired
    private InstitutionDomainRepository domainRepository;

    @Test
    void findByPublicSlug_returnsDemoInstitutionWithSectorsAndDomain() {
        final InstitutionPersistenceAdapter adapter = new InstitutionPersistenceAdapter(repository, domainRepository);

        final Institution institution = adapter.findByPublicSlug("demo-institution").orElseThrow();

        assertThat(institution.legalName()).isEqualTo("OEI Démonstration SA");
        assertThat(institution.sectors()).contains("banking", "consulting");
        assertThat(institution.emailDomains()).extracting(domain -> domain.domain()).contains("oei-demo-institution.org");
    }

    @Test
    void findById_returnsEmptyForUnknownInstitution() {
        final InstitutionPersistenceAdapter adapter = new InstitutionPersistenceAdapter(repository, domainRepository);

        assertThat(adapter.findById(InstitutionId.newId())).isEmpty();
    }
}
