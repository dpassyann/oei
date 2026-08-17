package global.oei.domain.core.verification;

import java.time.Instant;
import java.util.UUID;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
@Slf4j
@RequiredArgsConstructor
public class CreateVerificationRequestService implements CreateVerificationRequestUseCase {

    @NonNull
    private final VerificationRequestPort verificationRequestPort;

    @Override
    public VerificationRequest execute(final MemberId memberId, final VerificationType type, final String referenceId) {
        log.debug("createVerificationRequest: memberId={} type={} referenceId={}", memberId, type, referenceId);
        final VerificationRequest request = new VerificationRequest(
                UUID.randomUUID().toString(), memberId, type, referenceId, VerificationRequestStatus.PENDING, Instant.now(), null, null);
        log.info("createVerificationRequest: created requestId={} memberId={} status={}", request.id(), memberId, request.status());
        return verificationRequestPort.save(request);
    }
}
