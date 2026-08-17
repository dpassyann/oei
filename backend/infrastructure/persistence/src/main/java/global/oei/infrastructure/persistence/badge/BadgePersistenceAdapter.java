package global.oei.infrastructure.persistence.badge;

import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.badge.Badge;
import global.oei.domain.shared.badge.BadgeAward;
import global.oei.domain.shared.badge.BadgeAwardPort;
import global.oei.domain.shared.badge.BadgeAwardSource;
import global.oei.domain.shared.badge.BadgeCatalogPort;
import global.oei.domain.shared.badge.BadgeCategory;
import global.oei.domain.shared.member.MemberId;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BadgePersistenceAdapter implements BadgeCatalogPort, BadgeAwardPort {

    private final BadgeRepository badgeRepository;
    private final BadgeAwardRepository badgeAwardRepository;

    @Override
    public List<Badge> listCatalog() {
        return badgeRepository.findAll().stream().map(BadgePersistenceAdapter::toDomain).toList();
    }

    @Override
    public List<BadgeAward> findByMemberId(final MemberId memberId) {
        return badgeAwardRepository.findByMemberId(memberId.value()).stream()
                .map(BadgePersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public BadgeAward save(final BadgeAward award) {
        final BadgeAwardEntity entity = new BadgeAwardEntity(
                UUID.fromString(award.id()), award.badgeId(), award.memberId().value(), award.awardedAt(), award.source().name(),
                award.awardedBy(), award.revoked());
        badgeAwardRepository.save(entity);
        return award;
    }

    private static Badge toDomain(final BadgeEntity entity) {
        return new Badge(
                entity.getId(),
                entity.getCode(),
                entity.getName(),
                entity.getDescription(),
                entity.getIconUrl(),
                BadgeCategory.valueOf(entity.getCategory()));
    }

    private static BadgeAward toDomain(final BadgeAwardEntity entity) {
        return new BadgeAward(
                entity.getId().toString(),
                entity.getBadgeId(),
                new MemberId(entity.getMemberId()),
                entity.getAwardedAt(),
                BadgeAwardSource.valueOf(entity.getSource()),
                entity.getAwardedBy(),
                entity.isRevoked());
    }
}
