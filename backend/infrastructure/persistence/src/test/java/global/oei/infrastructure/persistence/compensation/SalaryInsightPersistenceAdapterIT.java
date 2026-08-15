package global.oei.infrastructure.persistence.compensation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import global.oei.domain.shared.network.NetworkSalaryNodeType;
import global.oei.domain.shared.network.SalaryInsight;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), with the real
 * Liquibase changelog applied — including the {@code 0004-demo-members-and-compensation}
 * demo dataset, which is exactly what this test exercises: it asserts the anonymization
 * threshold behavior ({@code MIN_ANONYMIZED_SAMPLE_SIZE=5}, enforced one layer up in
 * {@code domain-core}'s {@code GetSalaryInsightService}, not here — see this port's own
 * Javadoc) actually holds against the real seeded data and the real JPQL aggregation query.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class SalaryInsightPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private CompensationDeclarationRepository repository;

    @Test
    void aggregate_returnsAnonymizedRangeForANodeWithAtLeastFiveDeclarations() {
        final SalaryInsightPersistenceAdapter adapter = new SalaryInsightPersistenceAdapter(repository);

        // "ia" domain node has 8 demo compensation declarations (0004-demo-members-and-
        // compensation.sql) -- well above the anonymization threshold.
        final SalaryInsight insight = adapter.aggregate(NetworkSalaryNodeType.DOMAIN, "ia", null).orElseThrow();

        assertThat(insight.sampleSize()).isGreaterThanOrEqualTo(5);
        assertThat(insight.low()).isPositive();
        assertThat(insight.high()).isGreaterThanOrEqualTo(insight.low());
        assertThat(insight.currency()).isEqualTo("CHF");
    }

    @Test
    void aggregate_returnsEmptyForANodeThatDoesNotExist() {
        final SalaryInsightPersistenceAdapter adapter = new SalaryInsightPersistenceAdapter(repository);

        final var insight = adapter.aggregate(NetworkSalaryNodeType.DOMAIN, "does-not-exist", null);

        assertThat(insight).isEmpty();
    }
}
