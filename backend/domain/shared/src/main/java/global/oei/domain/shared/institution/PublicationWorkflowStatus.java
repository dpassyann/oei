package global.oei.domain.shared.institution;

/**
 * Lifecycle of an {@link InstitutionPublication}.
 */
public enum PublicationWorkflowStatus {
    DRAFT,
    SUBMITTED,
    CHECKS,
    REVIEW,
    CHANGES_REQUESTED,
    VALIDATED,
    TRANSLATED,
    PUBLISHED,
    ARCHIVED
}
