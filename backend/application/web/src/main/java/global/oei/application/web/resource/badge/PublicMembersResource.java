package global.oei.application.web.resource.badge;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.PublicMembersApi;
import global.oei.application.web.model.BadgeDTO;
import global.oei.application.web.resource.badge.adapter.BadgeAdapter;
import global.oei.application.web.resource.badge.mapper.BadgeDtoMapper;
import lombok.RequiredArgsConstructor;

/**
 * Implements {@code GET /api/public/v1/badges/catalog}, the only operation on
 * {@link PublicMembersApi} covered so far — its other operations (public profile, public CV
 * metadata, digital card, wallet pass verification) belong to different, not-yet-implemented
 * bounded contexts (public profile, CV, wallet) and fall back to the generator's default
 * {@code 501 Not Implemented} behavior. Named after the generated interface, per the
 * one-{@code @RestController}-per-generated-interface rule: a future public-profile/CV/wallet
 * slice extends this same class rather than creating a second one.
 */
@RestController
@RequiredArgsConstructor
public class PublicMembersResource implements PublicMembersApi {

    private final BadgeAdapter badgeAdapter;

    @Override
    public ResponseEntity<List<BadgeDTO>> listBadgeCatalog() {
        return ResponseEntity.ok(badgeAdapter.listCatalog().stream().map(BadgeDtoMapper::toDto).toList());
    }
}
