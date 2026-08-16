package global.oei.infrastructure.persistence.store;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StorePaymentRepository extends JpaRepository<StorePaymentEntity, UUID> {

    List<StorePaymentEntity> findByOrderId(UUID orderId);
}
