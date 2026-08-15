package global.oei.domain.core.verification;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.verification.CreateVerificationRequestUseCase;
import global.oei.domain.shared.verification.VerificationRequest;
import global.oei.domain.shared.verification.VerificationRequestPort;
import global.oei.domain.shared.verification.VerificationRequestStatus;
import global.oei.domain.shared.verification.VerificationType;

/**
 * Enforces the submission invariant on {@link VerificationRequest}: every request this
 * service creates starts {@link VerificationRequestStatus#PENDING}, with no reviewer/review
 * date yet — the review decision belongs to a separate, admin-facing operation.
 */
public class CreateVerificationRequestService implements CreateVerificationRequestUseCase {

    private final VerificationRequestPort verificationRequestPort;

    public CreateVerificationRequestService(final VerificationRequestPort verificationRequestPort) {
        this.verificationRequestPort = Objects.requireNonNull(verificationRequestPort, "verificationRequestPort must not be null");
    }

    @Override
    public VerificationRequest execute(final MemberId memberId, final VerificationType type, final String referenceId) {
        final VerificationRequest request = new VerificationRequest(
                UUID.randomUUID().toString(), memberId, type, referenceId, VerificationRequestStatus.PENDING, Instant.now(), null, null);
        return verificationRequestPort.save(request);
    }
}
