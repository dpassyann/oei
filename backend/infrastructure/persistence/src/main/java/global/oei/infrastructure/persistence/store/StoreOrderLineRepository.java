package global.oei.infrastructure.persistence.store;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreOrderLineRepository extends JpaRepository<StoreOrderLineEntity, UUID> {

    List<StoreOrderLineEntity> findByOrderId(UUID orderId);
}
