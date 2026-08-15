package global.oei.infrastructure.persistence.badge;

import static org.assertj.core.api.Assertions.assertThat;

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

import global.oei.domain.shared.badge.Badge;
import global.oei.domain.shared.badge.BadgeAward;
import global.oei.domain.shared.member.MemberId;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied — including the {@code 0012-demo-badges} demo dataset (5 badges, each
 * awarded to 4 demo members).
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class BadgePersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private BadgeAwardRepository badgeAwardRepository;

    @Test
    void listCatalog_returnsTheFiveDemoBadges() {
        final BadgePersistenceAdapter adapter = new BadgePersistenceAdapter(badgeRepository, badgeAwardRepository);

        final List<Badge> catalog = adapter.listCatalog();

        assertThat(catalog).extracting(Badge::code).contains("MENTOR_OEI", "CONFERENCIER");
    }

    @Test
    void findByMemberId_returnsTheDemoMembersAwardedBadge() {
        final BadgePersistenceAdapter adapter = new BadgePersistenceAdapter(badgeRepository, badgeAwardRepository);

        final List<BadgeAward> awards =
                adapter.findByMemberId(new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489")));

        assertThat(awards).extracting(BadgeAward::badgeId).contains("badge-mentor");
    }
}
