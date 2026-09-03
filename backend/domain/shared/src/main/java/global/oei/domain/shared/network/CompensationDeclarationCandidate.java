package global.oei.domain.shared.network;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * One row a member's {@code ProfessionalProfile} is willing to feed into the anonymized
 * {@code compensation_declaration} pool — derived from a single {@code Experience} that
 * carries a {@code grossAnnualSalary}, attached to one Professional Neural Network graph node.
 * Never exposed individually — see {@link SalaryInsightPort}'s own Javadoc for how it is only
 * ever read back as an anonymized, threshold-gated aggregate.
 */
public record CompensationDeclarationCandidate(
        NetworkSalaryNodeType nodeType, String nodeId, String country, BigDecimal amount, String currency,
        CompensationPeriod period) {

    public CompensationDeclarationCandidate {
        Objects.requireNonNull(nodeType, "nodeType must not be null");
        Objects.requireNonNull(nodeId, "nodeId must not be null");
        if (nodeId.isBlank()) {
            throw new IllegalArgumentException("nodeId must not be blank");
        }
        Objects.requireNonNull(amount, "amount must not be null");
        if (amount.signum() <= 0) {
            throw new IllegalArgumentException("amount must be strictly positive");
        }
        Objects.requireNonNull(currency, "currency must not be null");
        if (currency.isBlank()) {
            throw new IllegalArgumentException("currency must not be blank");
        }
        Objects.requireNonNull(period, "period must not be null");
    }
}
