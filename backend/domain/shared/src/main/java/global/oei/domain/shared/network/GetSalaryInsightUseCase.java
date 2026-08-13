package global.oei.domain.shared.network;

import java.util.Optional;

/**
 * Inbound port: anonymized salary transparency for one graph node (domain/topic/certification),
 * optionally narrowed to one country.
 *
 * <p>Implemented in {@code domain-core} ({@code GetSalaryInsightService}), which is the sole
 * place enforcing {@link #MIN_ANONYMIZED_SAMPLE_SIZE}: an aggregate built from fewer
 * contributors than this never resolves to a range, matching the frontend's
 * {@code MIN_ANONYMIZED_SAMPLE_SIZE} (anonymization.ts) so the two features can never
 * disagree on "how anonymous is anonymous enough".</p>
 */
public interface GetSalaryInsightUseCase {

    /**
     * Minimum number of aggregated declarations required before a {@link SalaryInsight} is
     * ever returned. A pool with fewer contributors always resolves to
     * {@link Optional#empty()} — a value state, not an error.
     */
    int MIN_ANONYMIZED_SAMPLE_SIZE = 5;

    Optional<SalaryInsight> execute(NetworkSalaryNodeType nodeType, String nodeId, String country);
}
