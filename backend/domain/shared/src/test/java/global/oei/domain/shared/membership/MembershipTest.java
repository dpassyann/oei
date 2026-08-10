package global.oei.domain.shared.membership;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.junit.jupiter.api.Test;
import global.oei.domain.shared.member.MemberId;

class MembershipTest {

    private final Instant startedAt = Instant.now().minus(365, ChronoUnit.DAYS);

    @Test
    void isActive_trueOnlyForActiveStatus() {
        final Membership active = membershipWith(MembershipStatus.ACTIVE);
        final Membership pending = membershipWith(MembershipStatus.PENDING);

        assertThat(active.isActive()).isTrue();
        assertThat(pending.isActive()).isFalse();
    }

    @Test
    void isInGracePeriod_trueOnlyForGracePeriodStatus() {
        final Membership grace = membershipWith(MembershipStatus.GRACE_PERIOD);
        final Membership active = membershipWith(MembershipStatus.ACTIVE);

        assertThat(grace.isInGracePeriod()).isTrue();
        assertThat(active.isInGracePeriod()).isFalse();
    }

    @Test
    void grantsEntitlements_delegatesToStatus() {
        assertThat(membershipWith(MembershipStatus.HONORARY).grantsEntitlements()).isTrue();
        assertThat(membershipWith(MembershipStatus.TERMINATED).grantsEntitlements()).isFalse();
    }

    @Test
    void lastRenewalOrStart_returnsRenewedAtWhenPresent() {
        final Instant renewedAt = startedAt.plus(200, ChronoUnit.DAYS);
        final Membership membership = new Membership(
                MemberId.newId(), MembershipTier.STANDARD, MembershipStatus.ACTIVE, startedAt, renewedAt, null);

        assertThat(membership.lastRenewalOrStart()).isEqualTo(renewedAt);
    }

    @Test
    void lastRenewalOrStart_fallsBackToStartedAtWhenNeverRenewed() {
        final Membership membership = new Membership(
                MemberId.newId(), MembershipTier.STANDARD, MembershipStatus.ACTIVE, startedAt, null, null);

        assertThat(membership.lastRenewalOrStart()).isEqualTo(startedAt);
    }

    @Test
    void constructor_rejectsEndsAtBeforeStartedAt() {
        final Instant endsAt = startedAt.minus(1, ChronoUnit.DAYS);

        assertThatThrownBy(() -> new Membership(
                        MemberId.newId(), MembershipTier.STANDARD, MembershipStatus.ACTIVE, startedAt, null, endsAt))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_rejectsNullTier() {
        assertThatThrownBy(() -> new Membership(
                        MemberId.newId(), null, MembershipStatus.ACTIVE, startedAt, null, null))
                .isInstanceOf(NullPointerException.class);
    }

    private Membership membershipWith(final MembershipStatus status) {
        return new Membership(MemberId.newId(), MembershipTier.STANDARD, status, startedAt, null, null);
    }
}
