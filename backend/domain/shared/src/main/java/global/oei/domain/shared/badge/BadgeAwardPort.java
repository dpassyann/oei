package global.oei.domain.shared.badge;

import java.util.List;

import global.oei.domain.shared.member.MemberId;

public interface BadgeAwardPort {

    List<BadgeAward> findByMemberId(MemberId memberId);
}
