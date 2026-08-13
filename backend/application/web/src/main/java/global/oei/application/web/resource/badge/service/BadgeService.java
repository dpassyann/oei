package global.oei.application.web.resource.badge.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.badge.adapter.BadgeAdapter;
import global.oei.domain.shared.badge.Badge;
import global.oei.domain.shared.badge.BadgeAward;
import global.oei.domain.shared.badge.BadgeAwardPort;
import global.oei.domain.shared.badge.BadgeCatalogPort;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BadgeService implements BadgeAdapter {

    private final SecurityContextPort securityContextPort;
    private final BadgeCatalogPort badgeCatalogPort;
    private final BadgeAwardPort badgeAwardPort;

    @Override
    public List<Badge> listCatalog() {
        return badgeCatalogPort.listCatalog();
    }

    @Override
    public List<BadgeAward> listMyBadges() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return badgeAwardPort.findByMemberId(MemberId.of(identity.subject()));
    }
}
