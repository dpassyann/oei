package global.oei.infrastructure.persistence.member;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.MemberPort;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberPersistenceAdapter implements MemberPort {

    private final MemberRepository repository;

    /**
     * Persists a new {@link Member}. Uses {@link Propagation#REQUIRES_NEW} so that this
     * INSERT runs in its own transaction, independent of any outer transaction. This lets
     * callers catch {@link org.springframework.dao.DataIntegrityViolationException} (or
     * {@link org.springframework.orm.ObjectOptimisticLockingFailureException}) without
     * polluting the outer transaction, enabling a clean "get-or-create" retry on concurrent
     * first-login provisioning.
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Member save(final Member member) {
        log.debug("Persisting member id={} slug={}", member.id().value(), member.publicSlug());
        final MemberEntity entity = new MemberEntity(
                member.id().value(), member.publicSlug(), member.displayName(), member.legalName(), member.locale(), member.country(),
                member.accountType().name(), member.createdAt());
        final MemberEntity saved = repository.save(entity);
        log.info("Member provisioned id={}", saved.getId());
        return toDomain(saved);
    }

    @Override
    public Optional<Member> findById(final MemberId id) {
        return repository.findById(id.value()).map(MemberPersistenceAdapter::toDomain);
    }

    @Override
    public Optional<Member> findByPublicSlug(final String publicSlug) {
        return repository.findByPublicSlug(publicSlug).map(MemberPersistenceAdapter::toDomain);
    }

    @Override
    public List<Member> findAll() {
        return repository.findAll().stream().map(MemberPersistenceAdapter::toDomain).toList();
    }

    private static Member toDomain(final MemberEntity entity) {
        final Instant registeredAt = entity.getRegisteredAt() != null ? entity.getRegisteredAt() : Instant.now();
        return new Member(
                new MemberId(entity.getId()), entity.getPublicSlug(), entity.getDisplayName(), entity.getLegalName(), entity.getLocale(),
                entity.getCountry(), AccountType.valueOf(entity.getAccountType()), registeredAt);
    }
}
