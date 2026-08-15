package global.oei.infrastructure.persistence.content;

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

import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionStatus;
import global.oei.domain.shared.content.ContentSourceType;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentWorkflowStatus;
import global.oei.domain.shared.member.MemberId;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied. Covers the member-facing write path (save/findByAuthorMemberId/findById)
 * added alongside {@code createContribution} (tag {@code member-contributions}).
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class ContentContributionPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ContentContributionRepository repository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private ContentVersionRepository versionRepository;

    @Test
    void save_thenFindByAuthorMemberIdAndFindById_returnTheProposedContribution() {
        final ContentPersistenceAdapter contentAdapter = new ContentPersistenceAdapter(contentRepository, versionRepository);
        final String contentId = UUID.randomUUID().toString();
        contentAdapter.save(new Content(
                contentId, ContentType.ARTICLE, "acceptance-slug-" + contentId, ContentSourceType.CMS, "Titre",
                List.of(), null, null, ContentWorkflowStatus.DRAFT));

        final ContentContributionPersistenceAdapter adapter = new ContentContributionPersistenceAdapter(repository);
        final MemberId authorId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final String id = UUID.randomUUID().toString();
        final ContentContribution contribution = new ContentContribution(
                id, contentId, "diff --git a/x b/x", authorId, ContentContributionStatus.PROPOSED, Instant.now());

        adapter.save(contribution);

        final List<ContentContribution> byAuthor = adapter.findByAuthorMemberId(authorId);
        assertThat(byAuthor).extracting(ContentContribution::id).contains(id);

        final Optional<ContentContribution> byId = adapter.findById(id);
        assertThat(byId).isPresent();
        assertThat(byId.get().status()).isEqualTo(ContentContributionStatus.PROPOSED);
    }
}
