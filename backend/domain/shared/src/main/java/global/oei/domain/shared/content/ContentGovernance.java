package global.oei.domain.shared.content;

/**
 * Governance metadata attached to a {@link Content} item.
 */
public record ContentGovernance(boolean approvalRequired, String decisionId) {
}
