package global.oei.infrastructure.persistence.publicprofile;

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

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.publicprofile.PublicProfile;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;
import global.oei.infrastructure.persistence.member.MemberRepository;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied. Uses the real seeded demo member (Alice, 0004).
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class PublicProfilePersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private PublicProfileRepository repository;

    @Autowired
    private MemberRepository memberRepository;

    @Test
    void findByMemberId_withNoRowYet_returnsUnpublishedDefaultSeededFromMember() {
        final PublicProfilePersistenceAdapter adapter = new PublicProfilePersistenceAdapter(repository, memberRepository);
        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));

        final PublicProfile defaultProfile = adapter.findByMemberId(memberId);

        assertThat(defaultProfile.publicSlug()).isEqualTo("demo-alice-nguyen-0");
        assertThat(defaultProfile.isPublished()).isFalse();
        assertThat(defaultProfile.visibleFields()).isEmpty();
    }

    @Test
    void save_thenFindByMemberId_returnsThePublishedProfile() {
        final PublicProfilePersistenceAdapter adapter = new PublicProfilePersistenceAdapter(repository, memberRepository);
        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final PublicProfile published = new PublicProfile(
                memberId, "custom-alice-slug", List.of("displayName", "certifications"), "SEO desc", Instant.now(), 3);

        adapter.save(published);

        final PublicProfile found = adapter.findByMemberId(memberId);
        assertThat(found.publicSlug()).isEqualTo("custom-alice-slug");
        assertThat(found.visibleFields()).containsExactly("displayName", "certifications");
        assertThat(found.isPublished()).isTrue();
        assertThat(found.viewsCount()).isEqualTo(3);
    }
}
