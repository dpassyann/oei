package global.oei.domain.shared.network;

import java.util.List;

/**
 * {@code offset}/{@code limit} in, {@code items}/{@code total} out — mirrors the frontend's
 * {@code PagedResult<T>} (network-graph.port.ts), itself written to map directly onto Spring
 * Data JPA's {@code Pageable}/{@code Page<T>}.
 */
public record NetworkExpertPage(List<NetworkExpert> items, long total) {

    public NetworkExpertPage {
        items = List.copyOf(items == null ? List.of() : items);
    }
}
