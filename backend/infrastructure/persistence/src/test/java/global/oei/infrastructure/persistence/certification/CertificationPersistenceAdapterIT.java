package global.oei.infrastructure.persistence.certification;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
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

import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationStatus;
import global.oei.domain.shared.member.MemberId;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied. No demo member certifications are seeded, so this exercises a genuine
 * save-then-read round trip.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class CertificationPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private CertificationRepository repository;

    @Test
    void save_thenFindByMemberIdAndFindById_returnTheDeclaredCertification() {
        final CertificationPersistenceAdapter adapter = new CertificationPersistenceAdapter(repository);
        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final String id = UUID.randomUUID().toString();
        final Certification certification = new Certification(
                id,
                memberId,
                "AWS Certified Solutions Architect",
                "Amazon Web Services",
                "aws-csa-associate",
                LocalDate.of(2025, 1, 15),
                LocalDate.of(2028, 1, 15),
                "https://example.org/proof.pdf",
                CertificationStatus.DECLARED,
                null,
                null);

        adapter.save(certification);

        final List<Certification> byMember = adapter.findByMemberId(memberId);
        assertThat(byMember).extracting(Certification::id).contains(id);

        final Optional<Certification> byId = adapter.findById(id);
        assertThat(byId).isPresent();
        assertThat(byId.get().status()).isEqualTo(CertificationStatus.DECLARED);
    }
}
