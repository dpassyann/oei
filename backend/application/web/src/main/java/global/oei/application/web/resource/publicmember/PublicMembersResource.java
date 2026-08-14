package global.oei.application.web.resource.publicmember;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.PublicMembersApi;
import global.oei.application.web.model.BadgeDTO;
import global.oei.application.web.model.WalletPassVerificationDTO;
import global.oei.application.web.resource.badge.adapter.BadgeAdapter;
import global.oei.application.web.resource.badge.mapper.BadgeDtoMapper;
import global.oei.application.web.resource.wallet.adapter.WalletAdapter;
import global.oei.application.web.resource.wallet.mapper.WalletPassDtoMapper;
import lombok.RequiredArgsConstructor;

/**
 * Implements the public-facing operations of {@link PublicMembersApi} covered so far: the
 * badge catalog and wallet pass verification. Its other operations (public profile, public
 * CV metadata, digital card) belong to different, not-yet-implemented bounded contexts
 * (public profile, CV) and fall back to the generator's default {@code 501 Not Implemented}
 * behavior — documented here rather than silently. Named after the generated interface, per
 * the one-{@code @RestController}-per-generated-interface rule: reuses the same
 * {@code badge}/{@code wallet} adapter/service pairs those bounded contexts already own,
 * rather than duplicating them.
 */
@RestController
@RequiredArgsConstructor
public class PublicMembersResource implements PublicMembersApi {

    private final BadgeAdapter badgeAdapter;
    private final WalletAdapter walletAdapter;

    @Override
    public ResponseEntity<List<BadgeDTO>> listBadgeCatalog() {
        return ResponseEntity.ok(badgeAdapter.listCatalog().stream().map(BadgeDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<WalletPassVerificationDTO> verifyWalletPass(final String serialNumber) {
        return walletAdapter.verifyPass(serialNumber)
                .map(WalletPassDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
