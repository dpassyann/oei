package global.oei.domain.shared.membership;

/**
 * Lifecycle status of a {@link Membership}, mirrored one-to-one on the OEI OpenAPI
 * contract ({@code MembershipStatus} schema) — see ADR 0002. These values are already
 * frozen across the contract and the Angular frontend; do not reorder/rename.
 *
 * <p>Follows the enum-strategy style: each status knows, as a closed business decision,
 * whether it currently grants membership entitlements (see
 * {@code MembershipEntitlementService} on the frontend, which derives entitlements from
 * this exact status).</p>
 */
public enum MembershipStatus {
    PENDING(false),
    ACTIVE(true),
    GRACE_PERIOD(true),
    EXPIRED(false),
    SUSPENDED(false),
    HONORARY(true),
    FOUNDING(true),
    TERMINATED(false);

    private final boolean grantsEntitlements;

    MembershipStatus(final boolean grantsEntitlements) {
        this.grantsEntitlements = grantsEntitlements;
    }

    /**
     * Whether a membership in this status currently grants active entitlements
     * (content access, digital card, wallet passes, etc.).
     */
    public boolean grantsEntitlements() {
        return grantsEntitlements;
    }
}
