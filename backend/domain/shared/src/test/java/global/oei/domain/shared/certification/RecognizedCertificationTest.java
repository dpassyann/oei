package global.oei.domain.shared.certification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;

class RecognizedCertificationTest {

    private RecognizedCertification aCatalogEntry(final CertificationCatalogStatus status) {
        return new RecognizedCertification(
                "rc-1", "AWS Certified Solutions Architect", "Amazon Web Services", null, true, "Cloud & infrastructure",
                CertificationLevel.ARCHITECT, "en", CertificationOeiStatus.OEI_RECOGNIZED, List.of("Architecture cloud"), 36, null,
                "Certification cloud de référence.", status);
    }

    @Test
    void constructor_defaultsNullCompetenciesToEmptyList() {
        final RecognizedCertification entry = new RecognizedCertification(
                "rc-1", "PMP", "PMI", null, false, "Gouvernance", CertificationLevel.ENGINEER, "en",
                CertificationOeiStatus.PARTNER_RECOGNIZED, null, null, null, null, CertificationCatalogStatus.PUBLISHED);

        assertThat(entry.competencies()).isEmpty();
    }

    @Test
    void withDetails_preservesIdAndCatalogStatus_appliesEverythingElse() {
        final RecognizedCertification published = aCatalogEntry(CertificationCatalogStatus.PUBLISHED);
        final RecognizedCertification submitted = new RecognizedCertification(
                "ignored-id", "AWS Certified Solutions Architect - Professional", "AWS", "AWS-SAP-C02", false,
                "Cloud & infrastructure", CertificationLevel.SENIOR_EXPERT, "fr", CertificationOeiStatus.UNDER_REVIEW,
                List.of("Architecture avancée"), 24, "/parcours/cloud", "Nouvelle description.", CertificationCatalogStatus.ARCHIVED);

        final RecognizedCertification updated = published.withDetails(submitted);

        assertThat(updated.id()).isEqualTo("rc-1");
        assertThat(updated.catalogStatus()).isEqualTo(CertificationCatalogStatus.PUBLISHED);
        assertThat(updated.name()).isEqualTo("AWS Certified Solutions Architect - Professional");
        assertThat(updated.level()).isEqualTo(CertificationLevel.SENIOR_EXPERT);
        assertThat(updated.language()).isEqualTo("fr");
        assertThat(updated.description()).isEqualTo("Nouvelle description.");
    }

    @Test
    void archive_movesPublishedEntryToArchived() {
        final RecognizedCertification archived = aCatalogEntry(CertificationCatalogStatus.PUBLISHED).archive();

        assertThat(archived.catalogStatus()).isEqualTo(CertificationCatalogStatus.ARCHIVED);
    }

    @Test
    void archive_throwsWhenAlreadyArchived() {
        final RecognizedCertification alreadyArchived = aCatalogEntry(CertificationCatalogStatus.ARCHIVED);

        assertThatThrownBy(alreadyArchived::archive).isInstanceOf(IllegalStateException.class);
    }
}
