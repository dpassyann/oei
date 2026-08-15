package global.oei.domain.shared.badge;

import java.util.List;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link BadgeAward}.
 */
public interface BadgeAwardPort {

    List<BadgeAward> findByMemberId(MemberId memberId);

    BadgeAward save(BadgeAward award);
}
