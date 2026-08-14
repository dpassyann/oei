package global.oei.domain.shared.wallet;

import global.oei.domain.shared.member.MemberId;

public interface CreateWalletPassUseCase {

    WalletPass execute(MemberId memberId, WalletPassProvider provider);
}
