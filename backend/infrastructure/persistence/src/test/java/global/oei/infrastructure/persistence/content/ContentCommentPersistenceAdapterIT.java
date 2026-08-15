package global.oei.infrastructure.persistence.content;

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

import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentComment;
import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionStatus;
import global.oei.domain.shared.content.ContentSourceType;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentWorkflowStatus;
import global.oei.domain.shared.member.MemberId;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class ContentCommentPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ContentCommentRepository commentRepository;

    @Autowired
    private ContentContributionRepository contributionRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private ContentVersionRepository versionRepository;

    @Test
    void save_thenFindByContributionId_returnsTheComment() {
        final ContentPersistenceAdapter contentAdapter = new ContentPersistenceAdapter(contentRepository, versionRepository);
        final String contentId = UUID.randomUUID().toString();
        contentAdapter.save(new Content(
                contentId, ContentType.ARTICLE, "acceptance-comment-slug-" + contentId, ContentSourceType.CMS, "Titre",
                List.of(), null, null, ContentWorkflowStatus.DRAFT));

        final ContentContributionPersistenceAdapter contributionAdapter = new ContentContributionPersistenceAdapter(contributionRepository);
        final MemberId authorId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        final String contributionId = UUID.randomUUID().toString();
        contributionAdapter.save(new ContentContribution(
                contributionId, contentId, "diff --git a/x b/x", authorId, ContentContributionStatus.PROPOSED, Instant.now()));

        final ContentCommentPersistenceAdapter adapter = new ContentCommentPersistenceAdapter(commentRepository);
        final String commentId = UUID.randomUUID().toString();
        adapter.save(new ContentComment(commentId, contributionId, null, authorId.toString(), "Bon patch !", Instant.now()));

        final List<ContentComment> comments = adapter.findByContributionId(contributionId);
        assertThat(comments).extracting(ContentComment::id).contains(commentId);
        assertThat(comments).extracting(ContentComment::body).contains("Bon patch !");
    }
}
