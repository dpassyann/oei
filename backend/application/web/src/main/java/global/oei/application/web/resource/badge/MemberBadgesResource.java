package global.oei.application.web.resource.badge;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.MemberBadgesApi;
import global.oei.application.web.model.BadgeAwardDTO;
import global.oei.application.web.resource.badge.adapter.BadgeAdapter;
import global.oei.application.web.resource.badge.mapper.BadgeDtoMapper;
import lombok.RequiredArgsConstructor;

/**
 * Implements {@code GET /api/member/v1/badges} — the only operation on {@link MemberBadgesApi}.
 */
@RestController
@RequiredArgsConstructor
public class MemberBadgesResource implements MemberBadgesApi {

    private final BadgeAdapter badgeAdapter;

    @Override
    public ResponseEntity<List<BadgeAwardDTO>> listMyBadges() {
        return ResponseEntity.ok(badgeAdapter.listMyBadges().stream().map(BadgeDtoMapper::toDto).toList());
    }
}
