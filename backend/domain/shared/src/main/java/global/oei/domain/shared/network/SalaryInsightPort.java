package global.oei.domain.shared.network;

import java.util.Optional;

/**
 * Outbound port: raw aggregation of {@code CurrentCompensation} declarations attached to one
 * graph node, optionally narrowed to one country.
 *
 * <p>Deliberately dumb: this port reports whatever it measured, including a
 * {@link SalaryInsight#sampleSize()} below the anonymization threshold. Enforcing that
 * threshold (never exposing an insight built from too few contributors) is
 * {@link GetSalaryInsightUseCase}'s responsibility — a business rule, not a persistence
 * concern.</p>
 */
public interface SalaryInsightPort {

    Optional<SalaryInsight> aggregate(NetworkSalaryNodeType nodeType, String nodeId, String country);
}
