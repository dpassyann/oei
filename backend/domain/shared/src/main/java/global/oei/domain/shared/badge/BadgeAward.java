package global.oei.domain.shared.badge;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

public record BadgeAward(
        String id,
        String badgeId,
        MemberId memberId,
        Instant awardedAt,
        BadgeAwardSource source,
        String awardedBy,
        boolean revoked) {

    public BadgeAward {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(badgeId, "badgeId must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(awardedAt, "awardedAt must not be null");
        Objects.requireNonNull(source, "source must not be null");
    }
}
