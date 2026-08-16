package global.oei.application.web.resource.member.service;

import java.time.Instant;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.member.adapter.MembershipAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implements {@link MembershipAdapter} by resolving the current caller's identity via
 * {@link SecurityContextPort} and loading their {@link Membership} via
 * {@link MembershipLookupPort}.
 *
 * <p>If no membership row exists yet (e.g. initial provisioning was interrupted by a
 * concurrent request), this service auto-provisions a {@code STANDARD/PENDING} starter
 * membership so that {@code GET /api/member/v1/membership} never returns 404 to a
 * legitimately authenticated member.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipService implements MembershipAdapter {

    private final SecurityContextPort securityContextPort;
    private final MembershipLookupPort membershipLookupPort;

    @Override
    public Membership getMyMembership() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        final MemberId memberId = MemberId.of(identity.subject());

        try {
            return membershipLookupPort.findByMemberId(memberId)
                    .orElseGet(() -> {
                        log.info("Membership not found for memberId={} — auto-provisioning STANDARD/PENDING", memberId.value());
                        return membershipLookupPort.save(new Membership(
                                memberId, MembershipTier.STANDARD, MembershipStatus.PENDING,
                                Instant.now(), null, null));
                    });
        } catch (ObjectOptimisticLockingFailureException | DataIntegrityViolationException e) {
            log.info("Concurrent membership provisioning detected for memberId={} — retrying lookup", memberId.value());
            return membershipLookupPort.findByMemberId(memberId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Membership not found after concurrent provisioning"));
        }
    }
}
