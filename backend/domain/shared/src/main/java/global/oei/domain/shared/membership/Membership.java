package global.oei.domain.shared.membership;

import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * A member's adhesion to the OEI: level ({@link MembershipTier}), lifecycle
 * ({@link MembershipStatus}) and the dates that drive renewal/grace-period logic.
 *
 * @param memberId  owning member
 * @param tier      membership level
 * @param status    current lifecycle status
 * @param startedAt when this membership (in its current tier) started
 * @param renewedAt last renewal date, if any renewal ever happened
 * @param endsAt    date at/after which the membership lapses without renewal, if applicable
 *                  (honorary/founding memberships may have no end date)
 */
public record Membership(
        MemberId memberId,
        MembershipTier tier,
        MembershipStatus status,
        Instant startedAt,
        Instant renewedAt,
        Instant endsAt) {

    public Membership {
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(tier, "tier must not be null");
        Objects.requireNonNull(status, "status must not be null");
        Objects.requireNonNull(startedAt, "startedAt must not be null");
        if (endsAt != null && endsAt.isBefore(startedAt)) {
            throw new IllegalArgumentException("endsAt must not be before startedAt");
        }
    }

    /**
     * Whether this membership is in good standing right now (status {@code ACTIVE}).
     */
    public boolean isActive() {
        return status == MembershipStatus.ACTIVE;
    }

    /**
     * Whether this membership is past its renewal date but still tolerated
     * (status {@code GRACE_PERIOD}).
     */
    public boolean isInGracePeriod() {
        return status == MembershipStatus.GRACE_PERIOD;
    }

    /**
     * Whether this membership currently grants entitlements, delegating the actual
     * business rule to {@link MembershipStatus#grantsEntitlements()}.
     */
    public boolean grantsEntitlements() {
        return status.grantsEntitlements();
    }

    /**
     * Last known renewal date, defaulting to {@code startedAt} when the membership
     * has never been renewed.
     */
    public Instant lastRenewalOrStart() {
        return Optional.ofNullable(renewedAt).orElse(startedAt);
    }
}
