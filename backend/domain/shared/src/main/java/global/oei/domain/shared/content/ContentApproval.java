package global.oei.domain.shared.content;

import java.time.Instant;
import java.util.Objects;

public record ContentApproval(
        String id,
        String contentVersionId,
        ContentApprovalRole role,
        ContentApprovalDecision decision,
        String comment,
        String approverId,
        Instant decidedAt) {

    public ContentApproval {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(contentVersionId, "contentVersionId must not be null");
        Objects.requireNonNull(role, "role must not be null");
        Objects.requireNonNull(decision, "decision must not be null");
        Objects.requireNonNull(approverId, "approverId must not be null");
        Objects.requireNonNull(decidedAt, "decidedAt must not be null");
    }
}
