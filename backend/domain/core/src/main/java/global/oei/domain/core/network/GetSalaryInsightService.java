package global.oei.domain.core.network;

import java.util.Objects;
import java.util.Optional;

import global.oei.domain.shared.network.GetSalaryInsightUseCase;
import global.oei.domain.shared.network.NetworkSalaryNodeType;
import global.oei.domain.shared.network.SalaryInsight;
import global.oei.domain.shared.network.SalaryInsightPort;

/**
 * Enforces the anonymization threshold ({@link GetSalaryInsightUseCase#MIN_ANONYMIZED_SAMPLE_SIZE})
 * on top of the raw aggregate reported by {@link SalaryInsightPort}: an aggregate built from
 * fewer contributors never resolves to a range.
 */
public class GetSalaryInsightService implements GetSalaryInsightUseCase {

    private final SalaryInsightPort salaryInsightPort;

    public GetSalaryInsightService(final SalaryInsightPort salaryInsightPort) {
        this.salaryInsightPort = Objects.requireNonNull(salaryInsightPort, "salaryInsightPort must not be null");
    }

    @Override
    public Optional<SalaryInsight> execute(
            final NetworkSalaryNodeType nodeType, final String nodeId, final String country) {
        return salaryInsightPort.aggregate(nodeType, nodeId, country)
                .filter(insight -> insight.sampleSize() >= MIN_ANONYMIZED_SAMPLE_SIZE);
    }
}
