package global.oei.domain.core.verification;

import java.time.Instant;
import java.util.Optional;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.verification.ApproveVerificationRequestUseCase;
import global.oei.domain.shared.verification.VerificationRequest;
import global.oei.domain.shared.verification.VerificationRequestPort;

/**
 * Approves a pending {@link VerificationRequest}.
 */
@Slf4j
@RequiredArgsConstructor
public class ApproveVerificationRequestService implements ApproveVerificationRequestUseCase {

    @NonNull
    private final VerificationRequestPort verificationRequestPort;

    @Override
    public Optional<VerificationRequest> execute(final String requestId, final String reviewerId) {
        log.debug("ApproveVerificationRequestService: execute called");
        return verificationRequestPort.findById(requestId)
                .map(request -> verificationRequestPort.save(request.approve(reviewerId, Instant.now())));
    }
}
