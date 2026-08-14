package global.oei.application.web.resource.wallet.adapter;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.wallet.WalletPass;
import global.oei.domain.shared.wallet.WalletPassProvider;
import global.oei.domain.shared.wallet.WalletPassVerification;

public interface WalletAdapter {

    WalletPass createPass(WalletPassProvider provider);

    List<WalletPass> listMyPasses();

    Optional<WalletPass> revokePass(String id);

    Optional<WalletPassVerification> verifyPass(String serialNumber);
}
