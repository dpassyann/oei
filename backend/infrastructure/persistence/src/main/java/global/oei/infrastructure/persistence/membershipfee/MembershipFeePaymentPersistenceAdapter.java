package global.oei.infrastructure.persistence.membershipfee;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membershipfee.MembershipFeeAccountPort;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.membershipfee.MembershipFeePaymentStatus;
import global.oei.domain.shared.membershipfee.MembershipFeeTier;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipFeePaymentPersistenceAdapter implements MembershipFeeAccountPort {

    private final MembershipFeePaymentRepository repository;

    @Override
    public List<MembershipFeePayment> findByMemberId(final MemberId memberId) {
        return repository.findByMemberId(memberId.value()).stream()
                .map(MembershipFeePaymentPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public MembershipFeePayment save(final MembershipFeePayment payment) {
        final MembershipFeePaymentEntity entity = new MembershipFeePaymentEntity(
                UUID.fromString(payment.id()),
                payment.memberId().value(),
                payment.cycleYear(),
                payment.tier().name(),
                BigDecimal.valueOf(payment.amount()),
                payment.status().name(),
                payment.paidAt());
        repository.save(entity);
        return payment;
    }

    private static MembershipFeePayment toDomain(final MembershipFeePaymentEntity entity) {
        return new MembershipFeePayment(
                entity.getId().toString(),
                new MemberId(entity.getMemberId()),
                entity.getCycleYear(),
                MembershipFeeTier.valueOf(entity.getTier()),
                entity.getAmount().doubleValue(),
                MembershipFeePaymentStatus.valueOf(entity.getStatus()),
                entity.getPaidAt());
    }
}
