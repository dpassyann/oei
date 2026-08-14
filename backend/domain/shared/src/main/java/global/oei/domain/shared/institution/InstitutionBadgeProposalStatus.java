package global.oei.domain.shared.institution;

/**
 * Lifecycle of an {@link InstitutionBadgeProposal}.
 */
public enum InstitutionBadgeProposalStatus {
    PENDING,
    ACCEPTED_BY_MEMBER,
    DECLINED_BY_MEMBER,
    REJECTED_BY_OEI,
    AWARDED
}
