package global.oei.domain.shared.certification;

/**
 * Lifecycle of a {@link Certification}.
 */
public enum CertificationStatus {
    DECLARED,
    UNDER_REVIEW,
    VALIDATED,
    REJECTED,
    EXPIRED,
    REVOKED
}
