package global.oei.infrastructure.persistence.member;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.MemberPort;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberPersistenceAdapter implements MemberPort {

    private final MemberRepository repository;

    @Override
    @Transactional
    public Member save(final Member member) {
        final MemberEntity entity = new MemberEntity(
                member.id().value(), member.publicSlug(), member.displayName(), member.legalName(), member.locale(), member.country(),
                member.accountType().name(), member.createdAt());
        final MemberEntity saved = repository.save(entity);
        // MemberEntity's id column is @GeneratedValue: re-read it in case the generator
        // assigned a different value than the domain-generated MemberId, keeping the returned
        // aggregate's identity consistent with what was actually persisted.
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
