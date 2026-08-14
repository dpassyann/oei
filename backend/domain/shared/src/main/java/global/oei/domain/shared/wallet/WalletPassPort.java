package global.oei.domain.shared.wallet;

import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.member.MemberId;

/**
 * Outbound port for {@link WalletPass}.
 */
public interface WalletPassPort {

    WalletPass save(WalletPass pass);

    List<WalletPass> findByMemberId(MemberId memberId);

    Optional<WalletPass> findById(String id);

    Optional<WalletPassVerification> verifyBySerialNumber(String serialNumber);
}
