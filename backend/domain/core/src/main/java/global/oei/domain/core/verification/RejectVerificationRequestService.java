package global.oei.domain.core.verification;

import java.time.Instant;
import java.util.Optional;

import global.oei.domain.shared.verification.RejectVerificationRequestUseCase;
import global.oei.domain.shared.verification.VerificationRequest;
import global.oei.domain.shared.verification.VerificationRequestPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Rejects a pending {@link VerificationRequest}.
 */
@Slf4j
@RequiredArgsConstructor
public class RejectVerificationRequestService implements RejectVerificationRequestUseCase {

    @NonNull
    private final VerificationRequestPort verificationRequestPort;

    @Override
    public Optional<VerificationRequest> execute(final String requestId, final String reviewerId) {
        log.debug("RejectVerificationRequestService: execute called");
        return verificationRequestPort.findById(requestId)
                .map(request -> verificationRequestPort.save(request.reject(reviewerId, Instant.now())));
    }
}
