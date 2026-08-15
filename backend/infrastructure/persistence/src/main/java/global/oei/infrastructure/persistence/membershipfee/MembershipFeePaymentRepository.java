package global.oei.infrastructure.persistence.membershipfee;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipFeePaymentRepository extends JpaRepository<MembershipFeePaymentEntity, UUID> {

    List<MembershipFeePaymentEntity> findByMemberId(UUID memberId);
}
