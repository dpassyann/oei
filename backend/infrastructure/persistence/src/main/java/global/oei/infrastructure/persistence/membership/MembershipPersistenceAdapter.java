package global.oei.infrastructure.persistence.membership;

import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipLookupPort;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membership.MembershipTier;

/**
 * Maps between {@link MembershipEntity} (JPA) and {@link Membership} (domain) at the
 * persistence boundary. Explicit, hand-written mapping: only six fields, MapStruct would
 * add ceremony without benefit here (see persistence skill reference).
 */
@Component
@Transactional(readOnly = true)
public class MembershipPersistenceAdapter implements MembershipLookupPort {

    private final MembershipRepository repository;

    public MembershipPersistenceAdapter(final MembershipRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Membership> findByMemberId(final MemberId memberId) {
        return repository.findByMemberId(memberId.value()).map(MembershipPersistenceAdapter::toDomain);
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
