package global.oei.application.web.resource.member.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.locks.LockSupport;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.application.web.resource.member.adapter.MembershipAdapter;
import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.MemberPort;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

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

    private static final int CONCURRENT_PROVISIONING_LOOKUP_ATTEMPTS = 20;
    private static final Duration CONCURRENT_PROVISIONING_RETRY_DELAY = Duration.ofMillis(100);

    private final SecurityContextPort securityContextPort;
    private final MemberPort memberPort;
    private final MembershipLookupPort membershipLookupPort;

    @Override
    public Membership getMyMembership() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        final MemberId memberId = MemberId.of(identity.subject());
        getOrProvisionMember(memberId, identity);

        try {
            return membershipLookupPort.findByMemberId(memberId)
                    .orElseGet(() -> {
                        log.info("Membership not found for memberId={} — auto-provisioning STANDARD/PENDING", memberId.value());
                        return membershipLookupPort.save(new Membership(
                                memberId, MembershipTier.STANDARD, MembershipStatus.PENDING,
                                Instant.now(), null, null));
                    });
        } catch (ObjectOptimisticLockingFailureException | DataIntegrityViolationException _) {
            log.info("Concurrent membership provisioning detected for memberId={} — retrying lookup", memberId.value());
            final Optional<Membership> existing =
                    retryLookupOptional(() -> membershipLookupPort.findByMemberId(memberId), "membership", memberId);
            if (existing.isPresent()) {
                return existing.get();
            }
            log.warn("Membership for memberId={} still not visible after concurrent retries; retrying explicit provisioning",
                    memberId.value());
            try {
                return membershipLookupPort.save(new Membership(
                        memberId, MembershipTier.STANDARD, MembershipStatus.PENDING,
                        Instant.now(), null, null));
            } catch (ObjectOptimisticLockingFailureException | DataIntegrityViolationException __) {
                return retryFindMembership(memberId);
            }
        }
    }

    private Member getOrProvisionMember(final MemberId memberId, final AuthenticatedIdentity identity) {
        try {
            return memberPort.findById(memberId)
                    .orElseGet(() -> {
                        log.info("Member not found for memberId={} — auto-provisioning REAL account", memberId.value());
                        return provisionMember(memberId, identity);
                    });
        } catch (ObjectOptimisticLockingFailureException | DataIntegrityViolationException _) {
            log.info("Concurrent member provisioning detected for id={} — retrying lookup", memberId.value());
            final Optional<Member> existing = retryLookupOptional(() -> memberPort.findById(memberId), "member", memberId);
            if (existing.isPresent()) {
                return existing.get();
            }
            log.warn("Member id={} still not visible after concurrent retries; retrying explicit provisioning", memberId.value());
            try {
                return provisionMember(memberId, identity);
            } catch (ObjectOptimisticLockingFailureException | DataIntegrityViolationException __) {
                return retryFindMember(memberId);
            }
        }
    }

    private Membership retryFindMembership(final MemberId memberId) {
        return retryLookup(
                () -> membershipLookupPort.findByMemberId(memberId),
                "membership",
                memberId,
                "Membership not found after concurrent provisioning");
    }

    private Member retryFindMember(final MemberId memberId) {
        return retryLookup(
                () -> memberPort.findById(memberId),
                "member",
                memberId,
                "Member not found after concurrent provisioning");
    }

    private <T> T retryLookup(
            final java.util.function.Supplier<Optional<T>> lookup,
            final String target,
            final MemberId memberId,
            final String failureMessage) {
        return retryLookupOptional(lookup, target, memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, failureMessage));
    }

    private <T> Optional<T> retryLookupOptional(
            final java.util.function.Supplier<Optional<T>> lookup,
            final String target,
            final MemberId memberId) {
        for (int attempt = 1; attempt <= CONCURRENT_PROVISIONING_LOOKUP_ATTEMPTS; attempt++) {
            final Optional<T> resolved = lookup.get();
            if (resolved.isPresent()) {
                return resolved;
            }
            if (attempt < CONCURRENT_PROVISIONING_LOOKUP_ATTEMPTS) {
                log.debug("Concurrent {} provisioning still not visible for memberId={} on retry {}/{}",
                        target, memberId.value(), attempt, CONCURRENT_PROVISIONING_LOOKUP_ATTEMPTS);
                LockSupport.parkNanos(CONCURRENT_PROVISIONING_RETRY_DELAY.toNanos());
            }
        }
        return Optional.empty();
    }

    private Member provisionMember(final MemberId memberId, final AuthenticatedIdentity identity) {
        final String displayName = resolveDisplayName(identity);
        final String slug = toSlug(memberId.value().toString());
        final Member member = new Member(
                memberId, slug, displayName, displayName,
                "fr", "FR",
                AccountType.REAL, Instant.now());
        return memberPort.save(member);
    }

    private static String resolveDisplayName(final AuthenticatedIdentity identity) {
        if (identity.displayName() != null && !identity.displayName().isBlank()) {
            return identity.displayName();
        }
        if (identity.email() != null && !identity.email().isBlank()) {
            return identity.email().contains("@")
                    ? identity.email().substring(0, identity.email().indexOf('@'))
                    : identity.email();
        }
        return identity.subject();
    }

    private static String toSlug(final String value) {
        return value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("((^-)|(-$))", "");
    }
}
