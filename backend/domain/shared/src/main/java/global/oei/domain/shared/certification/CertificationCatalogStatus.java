package global.oei.domain.shared.certification;

/**
 * Publication lifecycle of a {@link RecognizedCertification} catalog entry (governance side,
 * managed via {@code /api/admin/v1/certifications/catalog/**}). Never physically removed —
 * see {@link RecognizedCertification#archive()} (soft delete, same rule as the CMS/
 * institutions bounded contexts).
 */
public enum CertificationCatalogStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
}
