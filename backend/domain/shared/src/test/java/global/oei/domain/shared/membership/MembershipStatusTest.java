package global.oei.domain.shared.membership;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

class MembershipStatusTest {

    @ParameterizedTest
    @CsvSource({
        "PENDING, false",
        "ACTIVE, true",
        "GRACE_PERIOD, true",
        "EXPIRED, false",
        "SUSPENDED, false",
        "HONORARY, true",
        "FOUNDING, true",
        "TERMINATED, false"
    })
    void grantsEntitlements_matchesExpectedBusinessRule(final MembershipStatus status, final boolean expected) {
        assertThat(status.grantsEntitlements()).isEqualTo(expected);
    }

    @ParameterizedTest
    // Active/Honorary/Founding/GracePeriod: all 14 entitlements (11 original + 3 AI).
    // PENDING: PROFILE_EDIT + CV_EDIT + AI_CV_IMPORT = 3 (was 2 before AI entitlements).
    // EXPIRED: 4 (unchanged). SUSPENDED: 2 (unchanged). TERMINATED: 0.
    @CsvSource({"ACTIVE, 14", "HONORARY, 14", "FOUNDING, 14", "GRACE_PERIOD, 14", "EXPIRED, 4", "SUSPENDED, 2", "PENDING, 3", "TERMINATED, 0"})
    void entitlements_matchesExpectedSetSize(final MembershipStatus status, final int expectedSize) {
        assertThat(status.entitlements()).hasSize(expectedSize);
    }

    @org.junit.jupiter.api.Test
    void entitlements_terminatedGrantsNothing() {
        assertThat(MembershipStatus.TERMINATED.entitlements()).isEmpty();
    }

    @org.junit.jupiter.api.Test
    void entitlements_activeGrantsEverything() {
        assertThat(MembershipStatus.ACTIVE.entitlements()).containsExactlyInAnyOrder(MembershipEntitlement.values());
    }
}
