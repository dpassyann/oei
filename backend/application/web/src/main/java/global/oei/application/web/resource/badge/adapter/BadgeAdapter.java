package global.oei.application.web.resource.badge.adapter;

import java.util.List;

import global.oei.domain.shared.badge.Badge;
import global.oei.domain.shared.badge.BadgeAward;

public interface BadgeAdapter {

    List<Badge> listCatalog();

    List<BadgeAward> listMyBadges();
}
