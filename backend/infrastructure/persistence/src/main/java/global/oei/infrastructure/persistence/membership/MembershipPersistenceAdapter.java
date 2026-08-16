package global.oei.infrastructure.persistence.membership;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membership.MembershipTier;
import lombok.RequiredArgsConstructor;

/**
 * Maps between {@link MembershipEntity} (JPA) and {@link Membership} (domain) at the
 * persistence boundary. Explicit, hand-written mapping: only six fields, MapStruct would
 * add ceremony without benefit here (see persistence skill reference).
 *
 * <p>Not a {@code @Component}: no classpath component scanning is used in this project
 * (see the spring-boot-ddd-backend skill's "Explicit wiring" rule). This class is
 * instantiated explicitly as a {@code MembershipLookupPort} bean by
 * {@code infrastructure-wiring}'s {@code OeiWiringConfiguration}.</p>
 */
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipPersistenceAdapter implements MembershipLookupPort {

    private final MembershipRepository repository;

    @Override
    public Optional<Membership> findByMemberId(final MemberId memberId) {
        return repository.findByMemberId(memberId.value()).map(MembershipPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public Membership save(final Membership membership) {
        final MembershipEntity entity = new MembershipEntity(
                UUID.randomUUID(),
                membership.memberId().value(),
                membership.tier().name(),
                membership.status().name(),
                membership.startedAt(),
                membership.renewedAt(),
                membership.endsAt());
        // Use findByMemberId to detect existing row (idempotent upsert)
        return repository.findByMemberId(membership.memberId().value())
                .map(MembershipPersistenceAdapter::toDomain)
                .orElseGet(() -> toDomain(repository.save(entity)));
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
