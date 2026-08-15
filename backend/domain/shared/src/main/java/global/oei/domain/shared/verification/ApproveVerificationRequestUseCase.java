package global.oei.domain.shared.verification;

import java.util.Optional;

/**
 * Inbound port: approve a pending {@link VerificationRequest}.
 */
public interface ApproveVerificationRequestUseCase {

    Optional<VerificationRequest> execute(String requestId, String reviewerId);
}
