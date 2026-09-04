package global.oei.infrastructure.persistence.store;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StorePaymentRepository extends JpaRepository<StorePaymentEntity, UUID> {

    List<StorePaymentEntity> findByOrderId(UUID orderId);

    Optional<StorePaymentEntity> findByProviderReference(String providerReference);

    /**
     * Same lookup as {@link #findByProviderReference}, but acquires a pessimistic write lock on
     * the matching row for the duration of the enclosing transaction -- used by
     * {@link PaymentPersistenceAdapter#lockAndApply} to make read-decide-write webhook processing
     * atomic across concurrent deliveries for the same provider reference.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from StorePaymentEntity p where p.providerReference = :providerReference")
    Optional<StorePaymentEntity> findByProviderReferenceForUpdate(@Param("providerReference") String providerReference);
}
