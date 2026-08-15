package global.oei.domain.core.badge;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.badge.AwardBadgeUseCase;
import global.oei.domain.shared.badge.BadgeAward;
import global.oei.domain.shared.badge.BadgeAwardPort;
import global.oei.domain.shared.badge.BadgeAwardSource;
import global.oei.domain.shared.member.MemberId;

/**
 * Manually awards an official OEI {@link BadgeAward} to a member (admin action).
 */
public class AwardBadgeService implements AwardBadgeUseCase {

    private final BadgeAwardPort badgeAwardPort;

    public AwardBadgeService(final BadgeAwardPort badgeAwardPort) {
        this.badgeAwardPort = Objects.requireNonNull(badgeAwardPort, "badgeAwardPort must not be null");
    }

    @Override
    public BadgeAward execute(final MemberId memberId, final String badgeId, final String awardedBy) {
        final BadgeAward award = new BadgeAward(
                UUID.randomUUID().toString(), badgeId, memberId, Instant.now(), BadgeAwardSource.MANUAL, awardedBy, false);
        return badgeAwardPort.save(award);
    }
}
