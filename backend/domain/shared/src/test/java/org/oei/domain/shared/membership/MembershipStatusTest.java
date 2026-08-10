package org.oei.domain.shared.membership;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

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
}
