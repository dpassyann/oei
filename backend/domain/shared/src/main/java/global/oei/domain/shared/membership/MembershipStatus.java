package global.oei.domain.shared.membership;

import static global.oei.domain.shared.membership.MembershipEntitlement.AI_CV_IMPORT;
import static global.oei.domain.shared.membership.MembershipEntitlement.CV_EDIT;
import static global.oei.domain.shared.membership.MembershipEntitlement.MEMBER_DIRECTORY;
import static global.oei.domain.shared.membership.MembershipEntitlement.PROFILE_EDIT;
import static global.oei.domain.shared.membership.MembershipEntitlement.PROFILE_PUBLIC;

import java.util.EnumSet;
import java.util.Set;

/**
 * Lifecycle status of a {@link Membership}, mirrored one-to-one on the OEI OpenAPI
 * contract ({@code MembershipStatus} schema) — see ADR 0002. These values are already
 * frozen across the contract and the Angular frontend; do not reorder/rename.
 *
 * <p>Follows the enum-strategy style: each status knows, as a closed business decision,
 * whether it currently grants membership entitlements, and the exact set of entitlements it
 * grants — mirrors the frontend's {@code computeMembershipEntitlements}
 * (membership-entitlement.ts) so the two never disagree.</p>
 */
public enum MembershipStatus {
    /**
     * Membership in progress — profile and CV editing allowed, plus AI_CV_IMPORT to
     * complete the import-first onboarding flow, but public/premium capabilities withheld.
     */
    PENDING(false) {
        @Override
        public Set<MembershipEntitlement> entitlements() {
            return EnumSet.of(PROFILE_EDIT, CV_EDIT, AI_CV_IMPORT);
        }
    },
    ACTIVE(true) {
        @Override
        public Set<MembershipEntitlement> entitlements() {
            return EnumSet.allOf(MembershipEntitlement.class);
        }
    },
    GRACE_PERIOD(true) {
        @Override
        public Set<MembershipEntitlement> entitlements() {
            return EnumSet.allOf(MembershipEntitlement.class);
        }
    },
    EXPIRED(false) {
        @Override
        public Set<MembershipEntitlement> entitlements() {
            return EnumSet.of(PROFILE_EDIT, PROFILE_PUBLIC, CV_EDIT, MEMBER_DIRECTORY);
        }
    },
    SUSPENDED(false) {
        @Override
        public Set<MembershipEntitlement> entitlements() {
            return EnumSet.of(PROFILE_EDIT, CV_EDIT);
        }
    },
    HONORARY(true) {
        @Override
        public Set<MembershipEntitlement> entitlements() {
            return EnumSet.allOf(MembershipEntitlement.class);
        }
    },
    FOUNDING(true) {
        @Override
        public Set<MembershipEntitlement> entitlements() {
            return EnumSet.allOf(MembershipEntitlement.class);
        }
    },
    TERMINATED(false) {
        @Override
        public Set<MembershipEntitlement> entitlements() {
            return EnumSet.noneOf(MembershipEntitlement.class);
        }
    };

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

    /**
     * The exact set of {@link MembershipEntitlement} granted by this status. See the
     * frontend's {@code computeMembershipEntitlements} (membership-entitlement.ts) for the
     * rationale behind each status's set — kept in sync deliberately.
     */
    public abstract Set<MembershipEntitlement> entitlements();
}
