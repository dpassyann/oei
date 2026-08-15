package global.oei.infrastructure.persistence.cv;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import global.oei.domain.shared.cv.Cv;
import global.oei.domain.shared.cv.CvSection;
import global.oei.domain.shared.cv.CvSectionType;
import global.oei.domain.shared.cv.CvStatus;
import global.oei.domain.shared.member.MemberId;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2): asserts the
 * {@code cv_json} jsonb round-trip preserves a nested {@link CvSection} (itself containing
 * free-form {@code content}) intact — same "big object" risk as
 * {@code ProfessionalProfilePersistenceAdapterIT}.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class CvPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private CvRepository repository;

    @Test
    void saveThenFindById_roundTripsNestedSectionContentThroughJsonb() {
        final CvPersistenceAdapter adapter = new CvPersistenceAdapter(repository);
        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final String cvId = UUID.randomUUID().toString();
        final CvSection section = new CvSection(
                "section-1", cvId, CvSectionType.SUMMARY, 0, Map.of("text", "Résumé de démonstration."), List.of());
        final Cv cv = new Cv(cvId, memberId, "tpl-classic", "fr", CvStatus.DRAFT, List.of()).addSection(section);

        adapter.save(cv);
        final Cv reloaded = adapter.findById(cvId).orElseThrow();

        assertThat(reloaded.sections()).hasSize(1);
        assertThat(reloaded.sections().getFirst().type()).isEqualTo(CvSectionType.SUMMARY);
        assertThat(reloaded.sections().getFirst().content()).containsEntry("text", "Résumé de démonstration.");

        final List<Cv> byMember = adapter.findByMemberId(memberId);
        assertThat(byMember).extracting(Cv::id).contains(cvId);
    }
}
