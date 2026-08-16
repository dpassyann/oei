package global.oei.domain.core.badge;

import java.time.Instant;
import java.util.UUID;

import global.oei.domain.shared.badge.AwardBadgeUseCase;
import global.oei.domain.shared.badge.BadgeAward;
import global.oei.domain.shared.badge.BadgeAwardPort;
import global.oei.domain.shared.badge.BadgeAwardSource;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Manually awards an official OEI {@link BadgeAward} to a member (admin action).
 */
@Slf4j
@RequiredArgsConstructor
public class AwardBadgeService implements AwardBadgeUseCase {

    @NonNull
    private final BadgeAwardPort badgeAwardPort;

    @Override
    public BadgeAward execute(final MemberId memberId, final String badgeId, final String awardedBy) {
        log.debug("awardBadge: memberId={} badgeId={} awardedBy={}", memberId, badgeId, awardedBy);
        final BadgeAward award = new BadgeAward(
                UUID.randomUUID().toString(), badgeId, memberId, Instant.now(), BadgeAwardSource.MANUAL, awardedBy, false);
        log.info("awardBadge: awarded badgeId={} memberId={}", badgeId, memberId);
        return badgeAwardPort.save(award);
    }
}
