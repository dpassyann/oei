package global.oei.domain.shared.profile;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExperienceTest {

    @Test
    void hasGrossAnnualSalary_isFalseWhenNotDeclared() {
        final Experience experience = new Experience(
                "e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false, null, null);

        assertThat(experience.hasGrossAnnualSalary()).isFalse();
    }

    @Test
    void hasGrossAnnualSalary_isTrueWhenBothAmountAndCurrencyAreSet() {
        final Experience experience = new Experience(
                "e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false,
                BigDecimal.valueOf(90000), "CHF");

        assertThat(experience.hasGrossAnnualSalary()).isTrue();
    }

    @Test
    void constructor_rejectsSalaryWithoutCurrency() {
        assertThatThrownBy(() -> new Experience(
                "e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false,
                BigDecimal.valueOf(90000), null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("salaryCurrency");
    }

    @Test
    void constructor_rejectsCurrencyWithoutSalary() {
        assertThatThrownBy(() -> new Experience(
                "e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false, null, "CHF"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("grossAnnualSalary");
    }

    @Test
    void constructor_rejectsZeroOrNegativeSalary() {
        assertThatThrownBy(() -> new Experience(
                "e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false, BigDecimal.ZERO, "CHF"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("positive");

        assertThatThrownBy(() -> new Experience(
                "e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false,
                BigDecimal.valueOf(-1), "CHF"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("positive");
    }

    @Test
    void constructor_rejectsBlankCurrency() {
        assertThatThrownBy(() -> new Experience(
                "e1", "OEI", "Architecte", LocalDate.of(2020, 1, 1), null, true, null, false,
                BigDecimal.valueOf(90000), "  "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("salaryCurrency");
    }
}
