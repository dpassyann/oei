package global.oei.infrastructure.persistence.store;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.UnaryOperator;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.payment.Payment;
import global.oei.domain.shared.payment.PaymentFailureReason;
import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.payment.PaymentStatus;
import global.oei.domain.shared.store.PaymentPort;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentPersistenceAdapter implements PaymentPort {

    private final StorePaymentRepository repository;

    @Override
    @Transactional
    public Payment save(final Payment payment) {
        final StorePaymentEntity entity = new StorePaymentEntity(
                UUID.fromString(payment.id()), UUID.fromString(payment.orderId()), payment.paymentMethod().name(), payment.providerReference(),
                payment.amount(), payment.currency(), payment.status().name(),
                payment.failureReason() == null ? null : payment.failureReason().name(), payment.createdAt(), payment.succeededAt());
        repository.save(entity);
        return payment;
    }

    @Override
    public Optional<Payment> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(PaymentPersistenceAdapter::toDomain);
    }

    @Override
    public List<Payment> findByOrderId(final String orderId) {
        return repository.findByOrderId(UUID.fromString(orderId)).stream().map(PaymentPersistenceAdapter::toDomain).toList();
    }

    @Override
    public Optional<Payment> findByProviderReference(final String providerReference) {
        return repository.findByProviderReference(providerReference).map(PaymentPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public Optional<Payment> lockAndApply(final String providerReference, final UnaryOperator<Payment> transition) {
        // Single transaction spanning the pessimistic-locked read, the caller-supplied
        // decide/transition step, and the write: the row lock is held until this method's
        // transaction commits, so a concurrent call for the same providerReference blocks until
        // this one is done -- closing the TOCTOU window that a plain findByProviderReference()
        // + save() pair leaves open.
        return repository.findByProviderReferenceForUpdate(providerReference)
                .map(entity -> save(transition.apply(toDomain(entity))));
    }

    private static Payment toDomain(final StorePaymentEntity entity) {
        return new Payment(
                entity.getId().toString(), entity.getOrderId().toString(), PaymentMethod.valueOf(entity.getPaymentMethod()),
                entity.getProviderReference(), entity.getAmount(), entity.getCurrency(), PaymentStatus.valueOf(entity.getStatus()),
                entity.getFailureReason() == null ? null : PaymentFailureReason.valueOf(entity.getFailureReason()),
                entity.getCreatedAt(), entity.getSucceededAt());
    }
}
