package global.oei.domain.shared.verification;

import global.oei.domain.shared.member.MemberId;

/**
 * Submits a new {@link VerificationRequest} on behalf of a member.
 */
public interface CreateVerificationRequestUseCase {

    VerificationRequest execute(MemberId memberId, VerificationType type, String referenceId);
}
