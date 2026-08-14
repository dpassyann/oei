package global.oei.domain.shared.institution;

/**
 * Administrative lifecycle status of an {@link Institution} (governance side, managed via
 * {@code /api/admin/v1/institutions/**}). Additive field: legacy institutions without it are
 * treated as {@link #ACTIVE}.
 */
public enum InstitutionWorkflowStatus {
    DRAFT,
    CONTACTED,
    DOCUMENTS_PENDING,
    APPROVED,
    ACTIVE,
    SUSPENDED,
    REVOKED,
    ARCHIVED
}
