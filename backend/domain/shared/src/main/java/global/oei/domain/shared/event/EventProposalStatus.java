package global.oei.domain.shared.event;

/**
 * Lifecycle of an {@link EventProposal}.
 */
public enum EventProposalStatus {
    DRAFT,
    SUBMITTED,
    AI_PRECHECK,
    MODERATOR_REVIEW,
    APPROVED,
    PUBLISHED,
    CHANGES_REQUESTED,
    REJECTED,
    CANCELLED,
    ENDED,
    ARCHIVED
}
