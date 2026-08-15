package global.oei.infrastructure.persistence.charter;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import global.oei.domain.shared.charter.EthicalCharterSignature;
import global.oei.domain.shared.member.MemberId;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied. Signatures are append-only (a member may sign successive charter
 * versions), so this exercises a genuine save-then-read round trip rather than reading
 * pre-loaded demo data (no demo signatures are seeded).
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class EthicalCharterSignaturePersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private EthicalCharterSignatureRepository repository;

    @Test
    void save_thenCountByMemberIdIn_findsTheSignature() {
        final EthicalCharterSignaturePersistenceAdapter adapter = new EthicalCharterSignaturePersistenceAdapter(repository);
        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final EthicalCharterSignature signature =
                new EthicalCharterSignature(UUID.randomUUID(), memberId, "2026.1", Instant.now());

        final EthicalCharterSignature saved = adapter.save(signature);

        assertThat(saved).isEqualTo(signature);
        assertThat(repository.countByMemberIdIn(List.of(memberId.value()))).isEqualTo(1L);
    }
}
