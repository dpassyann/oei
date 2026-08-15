package global.oei.infrastructure.persistence.event;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import global.oei.domain.shared.event.Event;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;

/**
 * Integration test against a real Postgres (Testcontainers, never H2), real Liquibase
 * changelog applied — including the {@code 0040-demo-events} demo dataset. Asserts the
 * {@code organizers_json}/{@code speakers_json} jsonb round-trip and the
 * {@code findPublished()} status filter.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class EventPersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private EventRepository repository;

    @Test
    void findBySlug_returnsDemoEventWithSpeakersAndOrganizers() {
        final EventPersistenceAdapter adapter = new EventPersistenceAdapter(repository);

        final Event event = adapter.findBySlug("colloque-ethique-ia-2026").orElseThrow();

        assertThat(event.organizers()).contains("Ordre International des Experts de l'Informatique");
        assertThat(event.speakers()).extracting(speaker -> speaker.name()).contains("Dr. Amina Traoré");
        assertThat(event.languages()).contains("fr", "en");
    }

    @Test
    void findPublished_excludesNeitherDemoEvent() {
        final EventPersistenceAdapter adapter = new EventPersistenceAdapter(repository);

        final List<Event> published = adapter.findPublished();

        assertThat(published).extracting(Event::slug).contains("colloque-ethique-ia-2026", "meetup-informatique-verte-lyon");
    }
}
