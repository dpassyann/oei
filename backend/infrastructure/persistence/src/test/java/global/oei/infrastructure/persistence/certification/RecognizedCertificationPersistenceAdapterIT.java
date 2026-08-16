package global.oei.infrastructure.persistence.certification;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import global.oei.domain.shared.certification.CertificationCatalogStatus;
import global.oei.domain.shared.certification.CertificationLevel;
import global.oei.domain.shared.certification.CertificationOeiStatus;
import global.oei.domain.shared.certification.RecognizedCertification;
import global.oei.domain.shared.certification.RecognizedCertificationPage;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied (which seeds 7 demo catalog entries — see
 * 0055-demo-recognized-certifications.sql), so assertions target containment rather than an
 * exact list/count.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class RecognizedCertificationPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private RecognizedCertificationRepository repository;

    @Test
    void save_thenFindById_returnsTheCatalogEntry() {
        final RecognizedCertificationPersistenceAdapter adapter = new RecognizedCertificationPersistenceAdapter(repository);
        final String id = UUID.randomUUID().toString();
        final RecognizedCertification entry = new RecognizedCertification(
                id, "Certified Ethical Hacker (CEH)", "EC-Council", "CEH-v13", false, "Cybersécurité", CertificationLevel.EXPERT, "en",
                CertificationOeiStatus.UNDER_REVIEW, List.of("Tests d'intrusion", "Ethical hacking"), 36, null,
                "Certification en tests d'intrusion offensifs.", CertificationCatalogStatus.PUBLISHED);

        adapter.save(entry);

        final Optional<RecognizedCertification> found = adapter.findById(id);
        assertThat(found).isPresent();
        assertThat(found.get().name()).isEqualTo("Certified Ethical Hacker (CEH)");
        assertThat(found.get().competencies()).containsExactly("Tests d'intrusion", "Ethical hacking");
        assertThat(found.get().catalogStatus()).isEqualTo(CertificationCatalogStatus.PUBLISHED);
    }

    @Test
    void findCatalog_returnsAPageContainingTheSavedEntry() {
        final RecognizedCertificationPersistenceAdapter adapter = new RecognizedCertificationPersistenceAdapter(repository);
        final String id = UUID.randomUUID().toString();
        adapter.save(new RecognizedCertification(
                id, "Databricks Certified Data Engineer", "Databricks", null, false, "Data & IA", CertificationLevel.ENGINEER, "en",
                CertificationOeiStatus.OEI_RECOGNIZED, List.of(), null, null, null, CertificationCatalogStatus.PUBLISHED));

        final RecognizedCertificationPage page = adapter.findCatalog(0, 100);

        assertThat(page.items()).extracting(RecognizedCertification::id).contains(id);
        assertThat(page.totalItems()).isGreaterThanOrEqualTo(8L);
        assertThat(page.page()).isZero();
        assertThat(page.pageSize()).isEqualTo(100);
    }
}
