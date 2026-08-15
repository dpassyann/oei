package global.oei.domain.core.verification;

import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

import global.oei.domain.shared.verification.ApproveVerificationRequestUseCase;
import global.oei.domain.shared.verification.VerificationRequest;
import global.oei.domain.shared.verification.VerificationRequestPort;

/**
 * Approves a pending {@link VerificationRequest}.
 */
public class ApproveVerificationRequestService implements ApproveVerificationRequestUseCase {

    private final VerificationRequestPort verificationRequestPort;

    public ApproveVerificationRequestService(final VerificationRequestPort verificationRequestPort) {
        this.verificationRequestPort = Objects.requireNonNull(verificationRequestPort, "verificationRequestPort must not be null");
    }

    @Override
    public Optional<VerificationRequest> execute(final String requestId, final String reviewerId) {
        return verificationRequestPort.findById(requestId)
                .map(request -> verificationRequestPort.save(request.approve(reviewerId, Instant.now())));
    }
}
