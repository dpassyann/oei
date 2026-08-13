package global.oei.domain.shared.profile;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.member.MemberId;

class ProfessionalProfileTest {

    private ProfessionalProfile blank() {
        return new ProfessionalProfile(
                MemberId.newId(), null, null, null, null, List.of(), List.of(), List.of(), List.of(), List.of(),
                List.of(), List.of(), null, 0);
    }

    @Test
    void withRecomputedCompleteness_isZeroForBlankProfile() {
        assertThat(blank().withRecomputedCompleteness().completenessScore()).isZero();
    }

    @Test
    void withRecomputedCompleteness_isFullWhenEveryCriterionIsMet() {
        final ProfessionalProfile complete = new ProfessionalProfile(
                MemberId.newId(),
                "Architecte cloud",
                "Résumé",
                "Genève",
                Availability.AVAILABLE,
                List.of("Cloud"),
                List.of("Kubernetes"),
                List.of("Finance"),
                List.of(new LanguageProficiency("fr", LanguageLevel.NATIVE)),
                List.of(new Experience("e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false)),
                List.of(new Education("ed1", "EPFL", "MSc", LocalDate.of(2015, 1, 1), LocalDate.of(2018, 1, 1), null)),
                List.of(
                        new Skill("s1", "Java", "lang", true),
                        new Skill("s2", "AWS", "cloud", false),
                        new Skill("s3", "Terraform", "cloud", false)),
                null,
                0);

        assertThat(complete.withRecomputedCompleteness().completenessScore()).isEqualTo(100);
    }

    @Test
    void withRecomputedCompleteness_isPartialWhenSomeCriteriaAreMissing() {
        final ProfessionalProfile partial = new ProfessionalProfile(
                MemberId.newId(),
                "Titre",
                "Résumé",
                "Lieu",
                Availability.AVAILABLE,
                List.of("Data"),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                null,
                0);

        // 2 of 6 criteria met (basic fields + expertiseAreas).
        assertThat(partial.withRecomputedCompleteness().completenessScore()).isEqualTo(33);
    }

    @Test
    void constructor_defaultsNullListsToEmpty() {
        final ProfessionalProfile profile =
                new ProfessionalProfile(MemberId.newId(), null, null, null, null, null, null, null, null, null, null, null, null, 0);

        assertThat(profile.expertiseAreas()).isEmpty();
        assertThat(profile.skills()).isEmpty();
    }
}
