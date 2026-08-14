package global.oei.domain.shared.institution;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;

/**
 * An immutable business audit trail entry (invitations, affiliation decisions, publications,
 * ...), distinct from the purely technical {@code BaseAudit} JPA columns — see that class's
 * Javadoc. {@link #institutionId()} is {@code null} for globally-scoped admin actions,
 * populated for institution-scoped ones (used to filter {@code listInstitutionAuditLog}).
 */
public record InstitutionAuditLog(
        String id,
        String institutionId,
        String actorId,
        String action,
        String targetType,
        String targetId,
        Instant occurredAt,
        Map<String, Object> metadata) {

    public InstitutionAuditLog {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(actorId, "actorId must not be null");
        Objects.requireNonNull(action, "action must not be null");
        Objects.requireNonNull(occurredAt, "occurredAt must not be null");
        metadata = metadata == null ? Map.of() : Map.copyOf(metadata);
    }
}
