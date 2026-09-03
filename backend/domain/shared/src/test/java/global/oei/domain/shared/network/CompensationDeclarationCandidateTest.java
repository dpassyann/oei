package global.oei.domain.shared.network;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CompensationDeclarationCandidateTest {

    @Test
    void constructor_acceptsAValidCandidate() {
        final CompensationDeclarationCandidate candidate = new CompensationDeclarationCandidate(
                NetworkSalaryNodeType.DOMAIN, "cloud", "Suisse", BigDecimal.valueOf(90000), "CHF", CompensationPeriod.YEAR);

        assertThat(candidate.nodeId()).isEqualTo("cloud");
    }

    @Test
    void constructor_rejectsBlankNodeId() {
        assertThatThrownBy(() -> new CompensationDeclarationCandidate(
                NetworkSalaryNodeType.DOMAIN, "  ", "Suisse", BigDecimal.valueOf(90000), "CHF", CompensationPeriod.YEAR))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_rejectsNonPositiveAmount() {
        assertThatThrownBy(() -> new CompensationDeclarationCandidate(
                NetworkSalaryNodeType.DOMAIN, "cloud", "Suisse", BigDecimal.ZERO, "CHF", CompensationPeriod.YEAR))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_rejectsBlankCurrency() {
        assertThatThrownBy(() -> new CompensationDeclarationCandidate(
                NetworkSalaryNodeType.DOMAIN, "cloud", "Suisse", BigDecimal.valueOf(90000), " ", CompensationPeriod.YEAR))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_allowsANullCountry() {
        final CompensationDeclarationCandidate candidate = new CompensationDeclarationCandidate(
                NetworkSalaryNodeType.DOMAIN, "cloud", null, BigDecimal.valueOf(90000), "CHF", CompensationPeriod.YEAR);

        assertThat(candidate.country()).isNull();
    }
}
