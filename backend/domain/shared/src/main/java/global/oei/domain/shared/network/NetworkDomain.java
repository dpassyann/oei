package global.oei.domain.shared.network;

import java.util.List;
import java.util.Objects;

/**
 * A Professional Neural Network "galaxy view" expertise domain. Mirrors the frontend's
 * {@code NetworkDomain} model (network-domain.model.ts). {@code x}/{@code y} are canvas
 * layout coordinates, not business data — persisted as-is so the graph renders
 * deterministically across reloads.
 */
public record NetworkDomain(String id, String label, double x, double y, List<String> neighborDomainIds) {

    public NetworkDomain {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(label, "label must not be null");
        neighborDomainIds = List.copyOf(neighborDomainIds == null ? List.of() : neighborDomainIds);
    }
}
