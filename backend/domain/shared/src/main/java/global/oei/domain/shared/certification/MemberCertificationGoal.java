package global.oei.domain.shared.certification;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

public record MemberCertificationGoal(
        String id,
        MemberId memberId,
        String recognizedCertificationId,
        MemberCertificationGoalStatus status,
        Instant createdAt,
        Instant updatedAt) {

    public MemberCertificationGoal {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(recognizedCertificationId, "recognizedCertificationId must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }
}
