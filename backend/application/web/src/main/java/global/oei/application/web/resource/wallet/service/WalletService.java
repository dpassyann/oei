package global.oei.application.web.resource.wallet.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.application.web.resource.wallet.adapter.WalletAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import global.oei.domain.shared.wallet.CreateWalletPassUseCase;
import global.oei.domain.shared.wallet.WalletPass;
import global.oei.domain.shared.wallet.WalletPassPort;
import global.oei.domain.shared.wallet.WalletPassProvider;
import global.oei.domain.shared.wallet.WalletPassVerification;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService implements WalletAdapter {

    private final SecurityContextPort securityContextPort;
    private final CreateWalletPassUseCase createWalletPassUseCase;
    private final WalletPassPort walletPassPort;

    @Override
    public WalletPass createPass(final WalletPassProvider provider) {
        return createWalletPassUseCase.execute(currentMemberId(), provider);
    }

    @Override
    public List<WalletPass> listMyPasses() {
        return walletPassPort.findByMemberId(currentMemberId());
    }

    @Override
    public Optional<WalletPass> revokePass(final String id) {
        final MemberId memberId = currentMemberId();
        return walletPassPort.findById(id)
                .filter(pass -> pass.memberId().equals(memberId))
                .map(pass -> walletPassPort.save(pass.revoke(Instant.now())));
    }

    @Override
    public Optional<WalletPassVerification> verifyPass(final String serialNumber) {
        return walletPassPort.verifyBySerialNumber(serialNumber);
    }

    private MemberId currentMemberId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return MemberId.of(identity.subject());
    }
}
