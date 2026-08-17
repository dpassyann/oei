package global.oei.infrastructure.persistence.compensation;

import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.network.CompensationPeriod;
import global.oei.domain.shared.network.NetworkSalaryNodeType;
import global.oei.domain.shared.network.SalaryInsight;
import global.oei.domain.shared.network.SalaryInsightPort;

/**
 * Reports the raw aggregate (min/max/count) of {@link CompensationDeclarationEntity} rows
 * attached to one graph node, without applying any anonymization threshold — that business
 * rule belongs to {@code domain-core}'s {@code GetSalaryInsightService}, not here.
 */
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryInsightPersistenceAdapter implements SalaryInsightPort {

    private final CompensationDeclarationRepository repository;

    @Override
    public Optional<SalaryInsight> aggregate(
            final NetworkSalaryNodeType nodeType, final String nodeId, final String country) {
        final SalaryAggregateProjection projection = repository.aggregate(nodeType.name(), nodeId, country);
        if (projection == null || projection.getSampleSize() == 0) {
            return Optional.empty();
        }
        return Optional.of(new SalaryInsight(
                projection.getLow().doubleValue(),
                projection.getHigh().doubleValue(),
                projection.getCurrency(),
                CompensationPeriod.valueOf(projection.getPeriod()),
                Math.toIntExact(projection.getSampleSize()),
                country));
    }
}
