package global.oei.domain.shared.network;

import java.util.List;
import java.util.Objects;

/**
 * A topic node in the professional network graph.
 */
public record NetworkTopic(
        String id, String domainId, String label, double x, double y, List<String> relatedTopicIds) {

    public NetworkTopic {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(domainId, "domainId must not be null");
        Objects.requireNonNull(label, "label must not be null");
        relatedTopicIds = List.copyOf(relatedTopicIds == null ? List.of() : relatedTopicIds);
    }
}
