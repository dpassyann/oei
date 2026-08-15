package global.oei.application.web.resource.membershipfee.mapper;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import global.oei.application.web.model.MembershipFeeAccountDTO;
import global.oei.application.web.model.MembershipFeePaymentDTO;
import global.oei.application.web.model.MembershipFeePaymentStatusDTO;
import global.oei.application.web.model.MembershipFeeTierDTO;
import global.oei.domain.shared.membershipfee.MembershipFeeAccount;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import lombok.experimental.UtilityClass;

@UtilityClass
public class MembershipFeeDtoMapper {

    public MembershipFeeAccountDTO toDto(final MembershipFeeAccount account) {
        return new MembershipFeeAccountDTO(
                account.memberId().value().toString(),
                MembershipFeeTierDTO.valueOf(account.tier().name()),
                account.payments().stream().map(MembershipFeeDtoMapper::toDto).toList());
    }

    public MembershipFeePaymentDTO toDto(final MembershipFeePayment payment) {
        return new MembershipFeePaymentDTO(
                payment.id(),
                payment.memberId().value().toString(),
                payment.cycleYear(),
                MembershipFeeTierDTO.valueOf(payment.tier().name()),
                payment.amount(),
                MembershipFeePaymentStatusDTO.valueOf(payment.status().name()),
                LocalDateTime.ofInstant(payment.paidAt(), ZoneOffset.UTC));
    }
}
