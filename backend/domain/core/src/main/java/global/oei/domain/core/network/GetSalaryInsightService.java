package global.oei.domain.core.network;

import java.util.Optional;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.network.GetSalaryInsightUseCase;
import global.oei.domain.shared.network.NetworkSalaryNodeType;
import global.oei.domain.shared.network.SalaryInsight;
import global.oei.domain.shared.network.SalaryInsightPort;

/**
 * Enforces the anonymization threshold ({@link GetSalaryInsightUseCase#MIN_ANONYMIZED_SAMPLE_SIZE})
 * on top of the raw aggregate reported by {@link SalaryInsightPort}: an aggregate built from
 * fewer contributors never resolves to a range.
 */
@Slf4j
@RequiredArgsConstructor
public class GetSalaryInsightService implements GetSalaryInsightUseCase {

    @NonNull
    private final SalaryInsightPort salaryInsightPort;

    @Override
    public Optional<SalaryInsight> execute(
            final NetworkSalaryNodeType nodeType, final String nodeId, final String country) {
        log.debug("GetSalaryInsightService: execute called");
        return salaryInsightPort.aggregate(nodeType, nodeId, country)
                .filter(insight -> insight.sampleSize() >= MIN_ANONYMIZED_SAMPLE_SIZE);
    }
}
