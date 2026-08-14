package global.oei.domain.core.wallet;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

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
public class CreateWalletPassService implements CreateWalletPassUseCase {

    private final WalletPassPort walletPassPort;

    public CreateWalletPassService(final WalletPassPort walletPassPort) {
        this.walletPassPort = Objects.requireNonNull(walletPassPort, "walletPassPort must not be null");
    }

    @Override
    public WalletPass execute(final MemberId memberId, final WalletPassProvider provider) {
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
