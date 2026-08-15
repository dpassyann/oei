package global.oei.domain.shared.verification;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A member's request for OEI staff to verify their identity, professional profile, or a
 * declared certification. Created by {@code CreateVerificationRequestService}, which enforces
 * the "always starts {@link VerificationRequestStatus#PENDING}, no reviewer yet" invariant;
 * reviewed later by admin staff (out of this slice's scope — see
 * {@code AdminGitApi}'s {@code approve}/{@code reject} operations).
 *
 * @param referenceId identifier of the object being verified (e.g. a declared certification's
 *                     id), nullable — not every {@link VerificationType} needs one
 */
public record VerificationRequest(
        String id,
        MemberId memberId,
        VerificationType type,
        String referenceId,
        VerificationRequestStatus status,
        Instant submittedAt,
        Instant reviewedAt,
        String reviewerId) {

    public VerificationRequest {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(type, "type must not be null");
        Objects.requireNonNull(status, "status must not be null");
        Objects.requireNonNull(submittedAt, "submittedAt must not be null");
    }
}
