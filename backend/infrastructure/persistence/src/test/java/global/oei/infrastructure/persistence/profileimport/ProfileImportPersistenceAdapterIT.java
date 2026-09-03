package global.oei.infrastructure.persistence.profileimport;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
import global.oei.domain.shared.profileimport.ProfileImport;
import global.oei.domain.shared.profileimport.ProfileImportSource;
import global.oei.domain.shared.profileimport.ProfileImportStatus;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test against a real Postgres (Testcontainers, never H2): asserts a
 * {@link ProfileImport} round-trips through {@link ProfileImportEntity}'s plain columns,
 * including a status transition persisted across two {@code save} calls.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class ProfileImportPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ProfileImportRepository repository;

    @Test
    void saveThenFindById_roundTripsFieldsAndPersistsStatusTransitions() {
        final ProfileImportPersistenceAdapter adapter = new ProfileImportPersistenceAdapter(repository);
        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final String importId = UUID.randomUUID().toString();
        final Instant createdAt = Instant.now().truncatedTo(ChronoUnit.MICROS);
        final ProfileImport uploaded = ProfileImport
                .create(importId, memberId, ProfileImportSource.CV_PDF, createdAt)
                .transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, createdAt, null);

        adapter.save(uploaded);
        final ProfileImport reloaded = adapter.findById(importId).orElseThrow();

        assertThat(reloaded.memberId()).isEqualTo(memberId);
        assertThat(reloaded.source()).isEqualTo(ProfileImportSource.CV_PDF);
        assertThat(reloaded.status()).isEqualTo(ProfileImportStatus.DOCUMENT_UPLOADED);
        assertThat(reloaded.errorCode()).isNull();

        final Instant failedAt = createdAt.plusSeconds(60);
        adapter.save(reloaded.transitionTo(ProfileImportStatus.FAILED, failedAt, "EXTRACTION_ERROR"));
        final ProfileImport failed = adapter.findById(importId).orElseThrow();

        assertThat(failed.status()).isEqualTo(ProfileImportStatus.FAILED);
        assertThat(failed.errorCode()).isEqualTo("EXTRACTION_ERROR");
        assertThat(failed.createdAt()).isEqualTo(createdAt);
    }

    @Test
    void findById_returnsEmptyWhenNoSessionExists() {
        final ProfileImportPersistenceAdapter adapter = new ProfileImportPersistenceAdapter(repository);

        assertThat(adapter.findById(UUID.randomUUID().toString())).isEmpty();
    }

    @Test
    void findLatestByMemberId_returnsTheMostRecentlyUpdatedSessionForThatMember() {
        final ProfileImportPersistenceAdapter adapter = new ProfileImportPersistenceAdapter(repository);
        final MemberId memberId = new MemberId(UUID.fromString("7ba40945-29ce-5fd0-9b85-2d8c4db75895"));
        final Instant t0 = Instant.now().truncatedTo(ChronoUnit.MICROS);

        final ProfileImport older = ProfileImport.create(UUID.randomUUID().toString(), memberId, ProfileImportSource.CV_PDF, t0)
                .transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, t0, null);
        adapter.save(older);

        final Instant t1 = t0.plusSeconds(60);
        final ProfileImport newer = ProfileImport
                .create(UUID.randomUUID().toString(), memberId, ProfileImportSource.CV_DOCX, t1)
                .transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, t1, null);
        adapter.save(newer);

        final ProfileImport latest = adapter.findLatestByMemberId(memberId).orElseThrow();

        assertThat(latest.id()).isEqualTo(newer.id());
        assertThat(latest.source()).isEqualTo(ProfileImportSource.CV_DOCX);
    }

    @Test
    void findLatestByMemberId_returnsEmptyWhenMemberNeverStartedASession() {
        final ProfileImportPersistenceAdapter adapter = new ProfileImportPersistenceAdapter(repository);

        assertThat(adapter.findLatestByMemberId(MemberId.newId())).isEmpty();
    }
}
