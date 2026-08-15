package global.oei.domain.shared.verification;

import java.util.Optional;

/**
 * Inbound port: reject a pending {@link VerificationRequest}.
 */
public interface RejectVerificationRequestUseCase {

    Optional<VerificationRequest> execute(String requestId, String reviewerId);
}
