package global.oei.domain.shared.network;

import java.util.List;
import java.util.Objects;

/**
 * A recognized certification node in the professional network graph.
 */
public record NetworkCertification(
        String id,
        String topicId,
        String domainId,
        String label,
        String provider,
        String prereqCertificationId,
        String description,
        List<String> validatedSkills,
        String validityPeriod,
        int expertCount,
        double x,
        double y) {

    public NetworkCertification {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(topicId, "topicId must not be null");
        Objects.requireNonNull(domainId, "domainId must not be null");
        Objects.requireNonNull(label, "label must not be null");
        validatedSkills = List.copyOf(validatedSkills == null ? List.of() : validatedSkills);
    }
}
