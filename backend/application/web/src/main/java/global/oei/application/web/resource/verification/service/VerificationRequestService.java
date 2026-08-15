package global.oei.application.web.resource.verification.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.verification.adapter.VerificationRequestAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import global.oei.domain.shared.verification.CreateVerificationRequestUseCase;
import global.oei.domain.shared.verification.VerificationRequest;
import global.oei.domain.shared.verification.VerificationRequestPort;
import global.oei.domain.shared.verification.VerificationType;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VerificationRequestService implements VerificationRequestAdapter {

    private final SecurityContextPort securityContextPort;
    private final VerificationRequestPort verificationRequestPort;
    private final CreateVerificationRequestUseCase createVerificationRequestUseCase;

    @Override
    public List<VerificationRequest> listMyRequests() {
        return verificationRequestPort.findByMemberId(currentMemberId());
    }

    @Override
    public VerificationRequest create(final VerificationType type, final String referenceId) {
        return createVerificationRequestUseCase.execute(currentMemberId(), type, referenceId);
    }

    private MemberId currentMemberId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return MemberId.of(identity.subject());
    }
}
