package global.oei.application.web.resource.verification;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.MemberVerificationApi;
import global.oei.application.web.model.VerificationRequestCreationDTO;
import global.oei.application.web.model.VerificationRequestDTO;
import global.oei.application.web.resource.verification.adapter.VerificationRequestAdapter;
import global.oei.application.web.resource.verification.mapper.VerificationRequestDtoMapper;
import global.oei.domain.shared.verification.VerificationType;

/**
 * Implements every operation of {@link MemberVerificationApi}.
 */
@RestController
@RequiredArgsConstructor
public class MemberVerificationResource implements MemberVerificationApi {

    private final VerificationRequestAdapter verificationRequestAdapter;

    @Override
    public ResponseEntity<List<VerificationRequestDTO>> listMyVerificationRequests() {
        return ResponseEntity.ok(
                verificationRequestAdapter.listMyRequests().stream().map(VerificationRequestDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<VerificationRequestDTO> createVerificationRequest(final VerificationRequestCreationDTO request) {
        final var created = verificationRequestAdapter.create(
                VerificationType.valueOf(request.getType().name()), request.getReferenceId());
        return ResponseEntity.status(HttpStatus.CREATED).body(VerificationRequestDtoMapper.toDto(created));
    }
}
