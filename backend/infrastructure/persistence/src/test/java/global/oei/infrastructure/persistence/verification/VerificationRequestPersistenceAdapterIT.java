package global.oei.infrastructure.persistence.verification;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
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

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.verification.VerificationRequest;
import global.oei.domain.shared.verification.VerificationRequestStatus;
import global.oei.domain.shared.verification.VerificationType;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied -- including the 0044 demo verification requests seed.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class VerificationRequestPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private VerificationRequestRepository repository;

    @Test
    void demoSeed_seedsPendingAndReviewedRequests() {
        final VerificationRequestPersistenceAdapter adapter = new VerificationRequestPersistenceAdapter(repository);
        final MemberId alice = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));

        final List<VerificationRequest> byAlice = adapter.findByMemberId(alice);

        assertThat(byAlice).extracting(VerificationRequest::status).contains(VerificationRequestStatus.PENDING);
    }

    @Test
    void save_thenFindById_returnsTheSubmittedRequest() {
        final VerificationRequestPersistenceAdapter adapter = new VerificationRequestPersistenceAdapter(repository);
        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final String id = UUID.randomUUID().toString();
        final VerificationRequest request = new VerificationRequest(
                id, memberId, VerificationType.CERTIFICATION, "cert-42", VerificationRequestStatus.PENDING, Instant.now(), null, null);

        adapter.save(request);

        final Optional<VerificationRequest> found = adapter.findById(id);
        assertThat(found).isPresent();
        assertThat(found.get().type()).isEqualTo(VerificationType.CERTIFICATION);
        assertThat(found.get().referenceId()).isEqualTo("cert-42");
    }
}
