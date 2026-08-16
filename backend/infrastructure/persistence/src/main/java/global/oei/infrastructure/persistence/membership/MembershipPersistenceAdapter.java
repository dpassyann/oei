package global.oei.infrastructure.persistence.membership;

import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membership.MembershipTier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Maps between {@link MembershipEntity} (JPA) and {@link Membership} (domain) at the
 * persistence boundary.
 */
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipPersistenceAdapter implements MembershipLookupPort {

    private final MembershipRepository repository;

    @Override
    public Optional<Membership> findByMemberId(final MemberId memberId) {
        return repository.findByMemberId(memberId.value()).map(MembershipPersistenceAdapter::toDomain);
    }

    /**
     * Idempotent upsert: if the membership already exists (concurrent provisioning), returns
     * the existing row. Uses {@link Propagation#REQUIRES_NEW} so that this INSERT runs in its
     * own transaction — callers can catch {@link org.springframework.dao.DataIntegrityViolationException}
     * without their outer transaction being marked rollback-only.
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Membership save(final Membership membership) {
        log.debug("Persisting membership for memberId={} tier={} status={}",
                membership.memberId().value(), membership.tier(), membership.status());
        // Idempotent upsert: if another concurrent request already inserted the row, return it
        return repository.findByMemberId(membership.memberId().value())
                .map(existing -> {
                    log.debug("Membership already exists for memberId={}, returning existing", membership.memberId().value());
                    return toDomain(existing);
                })
                .orElseGet(() -> {
                    final MembershipEntity entity = new MembershipEntity(
                            UUID.randomUUID(),
                            membership.memberId().value(),
                            membership.tier().name(),
                            membership.status().name(),
                            membership.startedAt(),
                            membership.renewedAt(),
                            membership.endsAt());
                    final MembershipEntity saved = repository.save(entity);
                    log.info("Membership provisioned for memberId={}", membership.memberId().value());
                    return toDomain(saved);
                });
    }

    private static Membership toDomain(final MembershipEntity entity) {
        return new Membership(
                new MemberId(entity.getMemberId()),
                MembershipTier.valueOf(entity.getTier()),
                MembershipStatus.valueOf(entity.getStatus()),
                entity.getStartedAt(),
                entity.getRenewedAt(),
                entity.getEndsAt());
    }
}
