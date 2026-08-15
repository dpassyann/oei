package global.oei.infrastructure.persistence.content;

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

import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentSourceType;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentWorkflowStatus;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2): asserts
 * {@code search()}'s type/status/tag filters (see {@link ContentPort}'s Javadoc on why this
 * is an in-memory filter over {@code findAll()}, not indexed SQL) against real persisted
 * rows.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class ContentPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ContentRepository repository;

    @Autowired
    private ContentVersionRepository versionRepository;

    @Test
    void search_filtersByTypeAndTag() {
        final ContentPersistenceAdapter adapter = new ContentPersistenceAdapter(repository, versionRepository);
        final Content article = new Content(
                UUID.randomUUID().toString(), ContentType.ARTICLE, "article-cybersecurite-" + UUID.randomUUID(),
                ContentSourceType.CMS, "Cybersécurité pour les PME", List.of("cybersecurite"), null, null, ContentWorkflowStatus.DRAFT);
        final Content whitepaper = new Content(
                UUID.randomUUID().toString(), ContentType.WHITEPAPER, "livre-blanc-ia-" + UUID.randomUUID(), ContentSourceType.CMS,
                "Livre blanc IA", List.of("ia"), null, null, ContentWorkflowStatus.DRAFT);
        adapter.save(article);
        adapter.save(whitepaper);

        final List<Content> onlyArticles = adapter.search(ContentType.ARTICLE, null, null, null, null);
        final List<Content> onlyCyberTag = adapter.search(null, null, null, "cybersecurite", null);

        assertThat(onlyArticles).extracting(Content::id).contains(article.id()).doesNotContain(whitepaper.id());
        assertThat(onlyCyberTag).extracting(Content::id).contains(article.id()).doesNotContain(whitepaper.id());
    }
}
