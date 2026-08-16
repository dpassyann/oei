package global.oei.domain.shared.certification;

import java.util.List;
import java.util.Objects;

/**
 * A public catalog entry of a certification recognized by OEI (the {@code /certifications}
 * page's own catalog, managed via {@code /api/admin/v1/certifications/catalog/**}). Distinct
 * from {@link Certification}, which is a member's individual declaration referencing one of
 * these entries by {@link #id()} ({@code Certification#recognizedCertificationId()}) — see
 * ADR 0002, which had left this schema without any dedicated endpoint in V1.
 */
public record RecognizedCertification(
        String id,
        String name,
        String issuingOrganization,
        String catalogReference,
        boolean autoValidate,
        String domain,
        CertificationLevel level,
        String language,
        CertificationOeiStatus oeiStatus,
        List<String> competencies,
        Integer validityMonths,
        String associatedPathRoute,
        String description,
        CertificationCatalogStatus catalogStatus) {

    public RecognizedCertification {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(name, "name must not be null");
        Objects.requireNonNull(issuingOrganization, "issuingOrganization must not be null");
        Objects.requireNonNull(oeiStatus, "oeiStatus must not be null");
        Objects.requireNonNull(catalogStatus, "catalogStatus must not be null");
        competencies = List.copyOf(competencies == null ? List.of() : competencies);
    }

    /**
     * @return a new instance with every editable/descriptive field from {@code submitted}
     *         applied; {@link #id()} and {@link #catalogStatus()} are always preserved from
     *         {@code this}, never overwritten by the caller-submitted body (status changes
     *         only ever happen through {@link #archive()})
     */
    public RecognizedCertification withDetails(final RecognizedCertification submitted) {
        return new RecognizedCertification(
                id,
                submitted.name(),
                submitted.issuingOrganization(),
                submitted.catalogReference(),
                submitted.autoValidate(),
                submitted.domain(),
                submitted.level(),
                submitted.language(),
                submitted.oeiStatus(),
                submitted.competencies(),
                submitted.validityMonths(),
                submitted.associatedPathRoute(),
                submitted.description(),
                catalogStatus);
    }

    /**
     * @return a new instance moved to {@link CertificationCatalogStatus#ARCHIVED} ("dépublier"
     *         — soft delete, catalog entries are never physically removed); throws if already
     *         archived
     */
    public RecognizedCertification archive() {
        if (catalogStatus == CertificationCatalogStatus.ARCHIVED) {
            throw new IllegalStateException("catalog entry is already archived");
        }
        return new RecognizedCertification(
                id, name, issuingOrganization, catalogReference, autoValidate, domain, level, language, oeiStatus, competencies,
                validityMonths, associatedPathRoute, description, CertificationCatalogStatus.ARCHIVED);
    }
}
