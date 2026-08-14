package global.oei.application.web.resource.wallet;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.MemberWalletApi;
import global.oei.application.web.model.WalletPassDTO;
import global.oei.application.web.resource.wallet.adapter.WalletAdapter;
import global.oei.application.web.resource.wallet.mapper.WalletPassDtoMapper;
import global.oei.domain.shared.wallet.WalletPass;
import global.oei.domain.shared.wallet.WalletPassProvider;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link MemberWalletApi}: no stub left on this interface.
 * Every pass created here is mocked (see {@code WalletPass}'s Javadoc).
 */
@RestController
@RequiredArgsConstructor
public class MemberWalletResource implements MemberWalletApi {

    private final WalletAdapter walletAdapter;

    @Override
    public ResponseEntity<WalletPassDTO> createAppleWalletPass() {
        return created(walletAdapter.createPass(WalletPassProvider.APPLE));
    }

    @Override
    public ResponseEntity<WalletPassDTO> createGoogleWalletPass() {
        return created(walletAdapter.createPass(WalletPassProvider.GOOGLE));
    }

    @Override
    public ResponseEntity<List<WalletPassDTO>> listMyWalletPasses() {
        return ResponseEntity.ok(walletAdapter.listMyPasses().stream().map(WalletPassDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<WalletPassDTO> revokeMyWalletPass(final String id) {
        return walletAdapter.revokePass(id)
                .map(WalletPassDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static ResponseEntity<WalletPassDTO> created(final WalletPass pass) {
        return ResponseEntity.status(HttpStatus.CREATED).body(WalletPassDtoMapper.toDto(pass));
    }
}
