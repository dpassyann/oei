package global.oei.infrastructure.persistence.membership;

import static org.assertj.core.api.Assertions.assertThat;

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
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied — including the {@code 0004-demo-members-and-compensation} demo dataset.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class MembershipPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private MembershipRepository repository;

    @Test
    void findByMemberId_returnsDemoMembersMembership() {
        final MembershipPersistenceAdapter adapter = new MembershipPersistenceAdapter(repository);

        final Membership membership =
                adapter.findByMemberId(new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"))).orElseThrow();

        assertThat(membership.tier()).isEqualTo(MembershipTier.STANDARD);
        assertThat(membership.status()).isEqualTo(MembershipStatus.ACTIVE);
    }

    @Test
    void findByMemberId_returnsEmptyForUnknownMember() {
        final MembershipPersistenceAdapter adapter = new MembershipPersistenceAdapter(repository);

        assertThat(adapter.findByMemberId(MemberId.newId())).isEmpty();
    }
}
