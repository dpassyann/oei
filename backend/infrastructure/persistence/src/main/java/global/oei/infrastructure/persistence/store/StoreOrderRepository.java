package global.oei.infrastructure.persistence.store;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreOrderRepository extends JpaRepository<StoreOrderEntity, UUID> {

    List<StoreOrderEntity> findByMemberId(UUID memberId);

    List<StoreOrderEntity> findByStatus(String status);
}
