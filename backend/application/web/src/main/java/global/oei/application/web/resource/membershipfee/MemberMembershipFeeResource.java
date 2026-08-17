package global.oei.application.web.resource.membershipfee;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.MemberMembershipFeeApi;
import global.oei.application.web.model.MembershipFeeAccountDTO;
import global.oei.application.web.model.MembershipFeePaymentDTO;
import global.oei.application.web.model.MembershipFeePaymentRequestDTO;
import global.oei.application.web.resource.membershipfee.adapter.MembershipFeeAdapter;
import global.oei.application.web.resource.membershipfee.mapper.MembershipFeeDtoMapper;
import global.oei.domain.shared.membershipfee.MembershipFeeTier;

/**
 * Implements every operation of {@link MemberMembershipFeeApi}. Every payment recorded here is
 * mocked (see {@code PayMembershipFeeService}'s Javadoc): no real payment processor.
 */
@RestController
@RequiredArgsConstructor
public class MemberMembershipFeeResource implements MemberMembershipFeeApi {

    private final MembershipFeeAdapter membershipFeeAdapter;

    @Override
    public ResponseEntity<MembershipFeeAccountDTO> getMyMembershipFeeAccount() {
        return ResponseEntity.ok(MembershipFeeDtoMapper.toDto(membershipFeeAdapter.getMyAccount()));
    }

    @Override
    public ResponseEntity<MembershipFeePaymentDTO> payMyMembershipFee(final MembershipFeePaymentRequestDTO request) {
        final var payment = membershipFeeAdapter.pay(
                MembershipFeeTier.valueOf(request.getTier().name()), request.getCycleYear(), request.getAmount());
        return ResponseEntity.status(HttpStatus.CREATED).body(MembershipFeeDtoMapper.toDto(payment));
    }
}
