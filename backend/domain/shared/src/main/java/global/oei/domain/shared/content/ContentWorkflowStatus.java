package global.oei.domain.shared.content;

/**
 * Lifecycle of a {@link Content} (and, kept in lockstep, its current {@link ContentVersion}):
 * {@code DRAFT -> IN_REVIEW -> LEGAL_REVIEW -> GOVERNANCE_REVIEW -> APPROVED ->
 * TRANSLATION_PENDING -> SCHEDULED -> PUBLISHED -> ARCHIVED}, with {@code REJECTED} as an
 * escape hatch back to {@code DRAFT} at any review step — see {@link Content}'s Javadoc.
 */
public enum ContentWorkflowStatus {
    DRAFT,
    IN_REVIEW,
    LEGAL_REVIEW,
    GOVERNANCE_REVIEW,
    APPROVED,
    TRANSLATION_PENDING,
    SCHEDULED,
    PUBLISHED,
    ARCHIVED,
    REJECTED
}
