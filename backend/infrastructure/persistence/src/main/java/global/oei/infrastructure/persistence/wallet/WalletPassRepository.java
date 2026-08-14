package global.oei.infrastructure.persistence.wallet;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletPassRepository extends JpaRepository<WalletPassEntity, UUID> {

    List<WalletPassEntity> findByMemberId(UUID memberId);

    Optional<WalletPassEntity> findBySerialNumber(String serialNumber);
}
