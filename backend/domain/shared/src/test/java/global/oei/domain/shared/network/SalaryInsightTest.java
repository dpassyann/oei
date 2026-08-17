package global.oei.domain.shared.network;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SalaryInsightTest {

    @Test
    void constructor_acceptsValidInsight() {
        new SalaryInsight(80000, 120000, "CHF", CompensationPeriod.YEAR, 5, "Suisse");
    }

    @Test
    void constructor_acceptsNullCountryForGlobalAggregate() {
        new SalaryInsight(80000, 120000, "CHF", CompensationPeriod.YEAR, 5, null);
    }

    @Test
    void constructor_rejectsBlankCurrency() {
        assertThatThrownBy(() -> new SalaryInsight(80000, 120000, "  ", CompensationPeriod.YEAR, 5, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_rejectsNegativeSampleSize() {
        assertThatThrownBy(() -> new SalaryInsight(80000, 120000, "CHF", CompensationPeriod.YEAR, -1, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_rejectsHighBelowLow() {
        assertThatThrownBy(() -> new SalaryInsight(120000, 80000, "CHF", CompensationPeriod.YEAR, 5, null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
