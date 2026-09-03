package global.oei.infrastructure.persistence.profile;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
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
import global.oei.domain.shared.profile.Availability;
import global.oei.domain.shared.profile.Experience;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.infrastructure.persistence.PersistenceIntegrationTestApp;
import global.oei.infrastructure.persistence.member.MemberEntity;
import global.oei.infrastructure.persistence.member.MemberRepository;

/**
 * Integration test against a real Postgres (Testcontainers, never H2): asserts the
 * {@code profile_json} jsonb round-trip (a plain domain-shared record, no Jackson
 * annotations, resolved via the canonical constructor) preserves nested collections
 * (experiences) intact — the highest-risk part of the "big object" persistence strategy
 * used for {@code ProfessionalProfile}/{@code Cv}/{@code Institution}/{@code Event}.
 */
@Testcontainers
@SpringBootTest(
        classes = PersistenceIntegrationTestApp.class,
        properties = {
                "spring.jpa.hibernate.ddl-auto=validate",
                "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml"
        })
class ProfessionalProfilePersistenceAdapterIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ProfessionalProfileRepository repository;

    @Autowired
    private MemberRepository memberRepository;

    @Test
    void saveThenFindByMemberId_roundTripsNestedExperiencesThroughJsonb() {
        final MemberId memberId = new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489"));
        
        // Create Member first to satisfy FK constraint
        final MemberEntity member = new MemberEntity(
                memberId.value(),
                "test-member",
                "Test Member",
                "Test Member",
                "fr",
                "FR",
                "REAL",
                java.time.Instant.now());
        memberRepository.save(member);
        
        final ProfessionalProfilePersistenceAdapter adapter = new ProfessionalProfilePersistenceAdapter(
                repository, memberRepository);
        
        final Experience experience = new Experience(
                "exp-1", "OEI Démonstration SA", "Architecte logiciel", LocalDate.of(2020, 1, 1), null, true,
                "Conception de systèmes distribués.", false, null, null);
        final ProfessionalProfile profile = new ProfessionalProfile(
                memberId, null, "Architecte logiciel senior", "Résumé de démonstration.", "Genève, Suisse", Availability.AVAILABLE,
                List.of("Cloud", "Sécurité"), List.of("Java", "Kubernetes"), List.of("Banque"), List.of(), List.of(experience),
                List.of(), List.of(), null, 0).withRecomputedCompleteness();

        adapter.save(profile);
        final ProfessionalProfile reloaded = adapter.findByMemberId(memberId).orElseThrow();

        assertThat(reloaded.title()).isEqualTo("Architecte logiciel senior");
        assertThat(reloaded.experiences()).hasSize(1);
        assertThat(reloaded.experiences().getFirst().organization()).isEqualTo("OEI Démonstration SA");
        assertThat(reloaded.experiences().getFirst().current()).isTrue();
        assertThat(reloaded.expertiseAreas()).containsExactly("Cloud", "Sécurité");
    }
}
