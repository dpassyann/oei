package global.oei.application.web.config.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.member.adapter.MembershipAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipEntitlement;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membership.MembershipTier;

/**
 * Proves {@link MemberEntitlementGuard} delegates straight to
 * {@code MembershipStatus.entitlements()} (no parallel rule table) and never lets a bare
 * {@code false} become a raw {@code 500} — always a {@link ResponseStatusException} that
 * {@code GlobalExceptionHandler} turns into a {@code ProblemDetail}.
 */
class MemberEntitlementGuardTest {

    private final MembershipAdapter membershipAdapter = mock(MembershipAdapter.class);
    private final MemberEntitlementGuard guard = new MemberEntitlementGuard(membershipAdapter);

    @Test
    void require_passesSilentlyWhenCurrentStatusGrantsTheEntitlement() {
        when(membershipAdapter.getMyMembership()).thenReturn(activeMembership());

        guard.require(MembershipEntitlement.CV_EXPORT_PDF);
        // no exception: ACTIVE grants every MembershipEntitlement per MembershipStatus.entitlements()
    }

    @Test
    void require_throwsForbiddenResponseStatusExceptionWhenCurrentStatusDoesNotGrantTheEntitlement() {
        when(membershipAdapter.getMyMembership()).thenReturn(expiredMembership());

        assertThatThrownBy(() -> guard.require(MembershipEntitlement.CV_EXPORT_PDF))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void require_propagatesUnauthorizedWhenNoCallerIsAuthenticated() {
        when(membershipAdapter.getMyMembership()).thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        assertThatThrownBy(() -> guard.require(MembershipEntitlement.CV_EXPORT_PDF))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    private static Membership activeMembership() {
        return new Membership(
                new MemberId(UUID.randomUUID()), MembershipTier.STANDARD, MembershipStatus.ACTIVE, Instant.now(), null, null);
    }

    private static Membership expiredMembership() {
        return new Membership(
                new MemberId(UUID.randomUUID()), MembershipTier.STANDARD, MembershipStatus.EXPIRED, Instant.now(), null, null);
    }
}
