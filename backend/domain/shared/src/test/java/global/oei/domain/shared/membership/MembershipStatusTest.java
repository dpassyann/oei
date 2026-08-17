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
    @CsvSource({"ACTIVE, 11", "HONORARY, 11", "FOUNDING, 11", "GRACE_PERIOD, 11", "EXPIRED, 4", "SUSPENDED, 2", "PENDING, 2", "TERMINATED, 0"})
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
