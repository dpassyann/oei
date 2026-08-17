package global.oei.domain.core.wallet;

import java.time.Instant;
import java.util.UUID;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.wallet.CreateWalletPassUseCase;
import global.oei.domain.shared.wallet.WalletPass;
import global.oei.domain.shared.wallet.WalletPassPort;
import global.oei.domain.shared.wallet.WalletPassProvider;
import global.oei.domain.shared.wallet.WalletPassStatus;

/**
 * Enforces the "always mocked" invariant documented on {@link WalletPass}: every pass this
 * service creates starts {@link WalletPassStatus#MOCKED}, {@code mocked=true}, with a
 * generated serial number — never a real signed {@code .pkpass}.
 */
@Slf4j
@RequiredArgsConstructor
public class CreateWalletPassService implements CreateWalletPassUseCase {

    @NonNull
    private final WalletPassPort walletPassPort;

    @Override
    public WalletPass execute(final MemberId memberId, final WalletPassProvider provider) {
        log.debug("CreateWalletPassService: execute called");
        final String serialNumber = "MOCK-" + UUID.randomUUID();
        final WalletPass pass = new WalletPass(
                UUID.randomUUID().toString(),
                memberId,
                provider,
                WalletPassStatus.MOCKED,
                serialNumber,
                null,
                null,
                Instant.now(),
                null,
                true);
        return walletPassPort.save(pass);
    }
}
