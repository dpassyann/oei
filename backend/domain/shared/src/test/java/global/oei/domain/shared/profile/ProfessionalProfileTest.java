package global.oei.domain.shared.profile;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.network.CompensationDeclarationCandidate;
import global.oei.domain.shared.network.CompensationPeriod;
import global.oei.domain.shared.network.NetworkSalaryNodeType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ProfessionalProfileTest {

    private ProfessionalProfile blank() {
        return new ProfessionalProfile(
                MemberId.newId(), null, null, null, null, null, List.of(), List.of(), List.of(), List.of(), List.of(),
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
                ProfileSource.CV_IMPORTED,
                "Architecte cloud",
                "Résumé",
                "Genève",
                Availability.AVAILABLE,
                List.of("Cloud"),
                List.of("Kubernetes"),
                List.of("Finance"),
                List.of(new LanguageProficiency("fr", LanguageLevel.NATIVE)),
                List.of(new Experience("e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false, null, null)),
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
                null,
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
                new ProfessionalProfile(MemberId.newId(), null, null, null, null, null, null, null, null, null, null, null, null, null, 0);

        assertThat(profile.expertiseAreas()).isEmpty();
        assertThat(profile.skills()).isEmpty();
    }

    @Test
    void deriveCompensationDeclarations_isEmptyWhenNoExperienceCarriesASalary() {
        final ProfessionalProfile profile = new ProfessionalProfile(
                MemberId.newId(), null, null, null, null, null, List.of("cloud"), List.of(), List.of(), List.of(),
                List.of(new Experience("e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false, null, null)),
                List.of(), List.of(), null, 0);

        assertThat(profile.deriveCompensationDeclarations("Suisse")).isEmpty();
    }

    @Test
    void deriveCompensationDeclarations_isEmptyWhenNoExpertiseAreaExistsToAttachTo() {
        final ProfessionalProfile profile = new ProfessionalProfile(
                MemberId.newId(), null, null, null, null, null, List.of(), List.of(), List.of(), List.of(),
                List.of(new Experience(
                        "e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false,
                        BigDecimal.valueOf(90000), "CHF")),
                List.of(), List.of(), null, 0);

        assertThat(profile.deriveCompensationDeclarations("Suisse")).isEmpty();
    }

    @Test
    void deriveCompensationDeclarations_fansOutOneCandidatePerSalariedExperienceTimesExpertiseArea() {
        final Experience salaried = new Experience(
                "e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false,
                BigDecimal.valueOf(90000), "CHF");
        final Experience unsalaried = new Experience(
                "e2", "Ancien employeur", "Développeur", LocalDate.of(2015, 1, 1), LocalDate.of(2019, 12, 31), false,
                null, false, null, null);
        final ProfessionalProfile profile = new ProfessionalProfile(
                MemberId.newId(), null, null, null, null, null, List.of("cloud", "data"), List.of(), List.of(), List.of(),
                List.of(salaried, unsalaried), List.of(), List.of(), null, 0);

        assertThat(profile.deriveCompensationDeclarations("Suisse")).containsExactlyInAnyOrder(
                new CompensationDeclarationCandidate(
                        NetworkSalaryNodeType.DOMAIN, "cloud", "Suisse", BigDecimal.valueOf(90000), "CHF", CompensationPeriod.YEAR),
                new CompensationDeclarationCandidate(
                        NetworkSalaryNodeType.DOMAIN, "data", "Suisse", BigDecimal.valueOf(90000), "CHF", CompensationPeriod.YEAR));
    }
}
