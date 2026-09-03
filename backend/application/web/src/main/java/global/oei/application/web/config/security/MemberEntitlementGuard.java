package global.oei.application.web.config.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.resource.member.adapter.MembershipAdapter;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipEntitlement;

/**
 * Server-side capability gate for actions the OpenAPI contract marks as entitlement-gated
 * (see {@code MembershipEntitlement}'s Javadoc). A {@code *Resource} calls {@link #require}
 * before executing a gated action instead of trusting the frontend's
 * {@code MembershipEntitlementService} alone — enforcement used to be client-side only,
 * flagged as the most significant security gap in the payments/membership domain
 * (audit {@code docs/audit/MEMBER-SPACE-CURRENT-STATE.md} §4, cross-referenced with §7's
 * broader "authorization lives only in the browser" finding).
 *
 * <p>Deliberately thin, on purpose: it never re-implements the entitlement decision — it
 * delegates straight to {@link Membership#status()}'s
 * {@link global.oei.domain.shared.membership.MembershipStatus#entitlements()}, the single,
 * contract-frozen source of truth (ADR 0002) already used to build the
 * {@code GET /api/member/v1/entitlements} response and mirrored by the frontend's
 * {@code computeMembershipEntitlements}. No {@code canUse(...)}-style parallel rule table is
 * introduced here; this class only reuses and enforces the existing one.</p>
 *
 * <p>Reuses {@link MembershipAdapter#getMyMembership()} (already resolving the caller's
 * identity via {@code SecurityContextPort} and the caller's {@code Membership} via
 * {@code MembershipLookupPort}, including auto-provisioning) rather than duplicating that
 * lookup here.</p>
 */
@Component
@RequiredArgsConstructor
public class MemberEntitlementGuard {

    private final MembershipAdapter membershipAdapter;

    /**
     * @throws ResponseStatusException {@code 401} when there is no authenticated caller
     *         (propagated from {@link MembershipAdapter#getMyMembership()}), or {@code 403}
     *         when the caller is authenticated but their current {@code MembershipStatus}
     *         does not grant {@code entitlement}. Both cases surface through
     *         {@code GlobalExceptionHandler} as a {@code ProblemDetail} — never a raw stack
     *         trace.
     */
    public void require(final MembershipEntitlement entitlement) {
        final Membership membership = membershipAdapter.getMyMembership();
        if (!membership.status().entitlements().contains(entitlement)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Membership status " + membership.status() + " does not grant " + entitlement + ".");
        }
    }
}
