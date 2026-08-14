package global.oei.domain.shared.wallet;

import global.oei.domain.shared.member.MemberId;

/**
 * Inbound port: create a (mocked) {@link WalletPass} for the current caller.
 */
public interface CreateWalletPassUseCase {

    WalletPass execute(MemberId memberId, WalletPassProvider provider);
}
