package global.oei.domain.core.verification;

import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

import global.oei.domain.shared.verification.RejectVerificationRequestUseCase;
import global.oei.domain.shared.verification.VerificationRequest;
import global.oei.domain.shared.verification.VerificationRequestPort;

/**
 * Rejects a pending {@link VerificationRequest}.
 */
public class RejectVerificationRequestService implements RejectVerificationRequestUseCase {

    private final VerificationRequestPort verificationRequestPort;

    public RejectVerificationRequestService(final VerificationRequestPort verificationRequestPort) {
        this.verificationRequestPort = Objects.requireNonNull(verificationRequestPort, "verificationRequestPort must not be null");
    }

    @Override
    public Optional<VerificationRequest> execute(final String requestId, final String reviewerId) {
        return verificationRequestPort.findById(requestId)
                .map(request -> verificationRequestPort.save(request.reject(reviewerId, Instant.now())));
    }
}
