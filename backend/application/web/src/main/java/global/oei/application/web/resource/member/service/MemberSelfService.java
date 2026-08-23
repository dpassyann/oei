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

import global.oei.application.web.model.MemberDTO;
import global.oei.application.web.resource.member.adapter.MemberSelfAdapter;
import global.oei.application.web.resource.member.mapper.MemberDtoMapper;
import global.oei.application.web.resource.member.mapper.MembershipDtoMapper;
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
 * Implements {@link MemberSelfAdapter}.
 *
 * <p>Auto-provisioning logic: when a user registers via the Keycloak native form (no call
 * to {@code POST /api/public/v1/accounts}), they have a valid JWT but no {@code Member} row
 * in the OEI database yet.  This service performs an idempotent "get or create" pattern:</p>
 * <ol>
 *   <li>Look up {@code Member} by the JWT {@code sub} (Keycloak subject = {@link MemberId}).</li>
 *   <li>If absent, create one from the JWT claims ({@code name}/{@code email}/{@code locale}).</li>
 *   <li>Look up {@code Membership} for that member.</li>
 *   <li>If absent, create a {@code STANDARD}/{@code PENDING} starter membership.</li>
 * </ol>
 *
 * <p>Concurrency safety: the provisioning steps are intentionally <em>not</em> wrapped in a
 * single outer transaction. {@link MemberPort#save} and {@link MembershipLookupPort#save}
 * each run in their own {@code REQUIRES_NEW} transaction (see
 * {@code MemberPersistenceAdapter} and {@code MembershipPersistenceAdapter}).  If two
 * concurrent first-login requests race, one will commit and the other will receive a
 * {@link DataIntegrityViolationException} or {@link ObjectOptimisticLockingFailureException}
 * from the inner transaction; this service catches those and retries the lookup.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberSelfService implements MemberSelfAdapter {

    private static final int CONCURRENT_PROVISIONING_LOOKUP_ATTEMPTS = 20;
    private static final Duration CONCURRENT_PROVISIONING_RETRY_DELAY = Duration.ofMillis(100);

    private final SecurityContextPort securityContextPort;
    private final MemberPort memberPort;
    private final MembershipLookupPort membershipLookupPort;

    @Override
    public MemberDTO getCurrentMember() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        final MemberId memberId = MemberId.of(identity.subject());

        // --- 1. Get or auto-provision Member ---
        final Member member = getOrProvisionMember(memberId, identity);

        // --- 2. Get or auto-provision Membership ---
        final Membership membership = getOrProvisionMembership(memberId);

        // --- 3. Build response DTO with embedded membership ---
        final MemberDTO dto = MemberDtoMapper.toDto(member);
        dto.setMembership(MembershipDtoMapper.toDto(membership));
        log.debug("getCurrentMember: returning member id={} membershipStatus={}", memberId.value(), membership.status());
        return dto;
    }

    /**
     * Idempotent get-or-create for {@link Member}. Catches concurrent-provisioning
     * exceptions and retries with a simple lookup.
     */
    private Member getOrProvisionMember(final MemberId memberId, final AuthenticatedIdentity identity) {
        try {
            return memberPort.findById(memberId)
                    .orElseGet(() -> {
                        log.info("Auto-provisioning member id={}", memberId.value());
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

    /**
     * Idempotent get-or-create for {@link Membership}. Catches concurrent-provisioning
     * exceptions and retries with a simple lookup.
     */
    private Membership getOrProvisionMembership(final MemberId memberId) {
        try {
            return membershipLookupPort.findByMemberId(memberId)
                    .orElseGet(() -> {
                        log.info("Auto-provisioning membership for memberId={}", memberId.value());
                        return membershipLookupPort.save(provisionMembership(memberId));
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
                return membershipLookupPort.save(provisionMembership(memberId));
            } catch (ObjectOptimisticLockingFailureException | DataIntegrityViolationException __) {
                return retryFindMembership(memberId);
            }
        }
    }

    private Member retryFindMember(final MemberId memberId) {
        return retryLookup(
                () -> memberPort.findById(memberId),
                "member",
                memberId,
                "Member not found after concurrent provisioning");
    }

    private Membership retryFindMembership(final MemberId memberId) {
        return retryLookup(
                () -> membershipLookupPort.findByMemberId(memberId),
                "membership",
                memberId,
                "Membership not found after concurrent provisioning");
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
            final Optional<T> candidate = lookup.get();
            if (candidate.isPresent()) {
                return candidate;
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

    private static Membership provisionMembership(final MemberId memberId) {
        return new Membership(memberId, MembershipTier.STANDARD, MembershipStatus.PENDING,
                Instant.now(), null, null);
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
