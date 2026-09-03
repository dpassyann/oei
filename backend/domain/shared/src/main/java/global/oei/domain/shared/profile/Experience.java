package global.oei.domain.shared.profile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * @param isDemoData never persisted for real members — carried only so demo-seeded profiles
 *                   can be flagged honestly if ever rendered, mirroring the frontend's demo
 *                   data honesty rule.
 * @param grossAnnualSalary the member's own gross annual salary ("salaire brut annuel") for
 *                          this specific experience. Deliberately private, always: never part
 *                          of any public-facing schema, never rendered on the digital business
 *                          card/CV/member directory or any {@code /api/public/**} endpoint —
 *                          same privacy rule as {@link CurrentCompensation}. This is the trigger
 *                          for a {@code compensation_declaration} row (see
 *                          {@link ProfessionalProfile#deriveCompensationDeclarations(String)}):
 *                          saving/updating an experience that carries this field feeds the
 *                          anonymized Professional Neural Network salary-transparency aggregate,
 *                          never an individually-visible figure. {@code null} means the member
 *                          did not declare a salary for this experience.
 * @param salaryCurrency ISO 4217 currency code (e.g. "CHF", "EUR") for {@link #grossAnnualSalary()};
 *                       required together with it, free text (not a hardcoded list) since OEI
 *                       members span many countries.
 */
public record Experience(
        String id,
        String organization,
        String title,
        LocalDate startDate,
        LocalDate endDate,
        boolean current,
        String description,
        boolean isDemoData,
        BigDecimal grossAnnualSalary,
        String salaryCurrency) {

    public Experience {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(organization, "organization must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(startDate, "startDate must not be null");
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("endDate must not be before startDate");
        }
        if (grossAnnualSalary != null) {
            if (grossAnnualSalary.signum() <= 0) {
                throw new IllegalArgumentException("grossAnnualSalary must be strictly positive");
            }
            if (salaryCurrency == null || salaryCurrency.isBlank()) {
                throw new IllegalArgumentException("salaryCurrency must not be blank when grossAnnualSalary is set");
            }
        } else if (salaryCurrency != null) {
            throw new IllegalArgumentException("salaryCurrency must not be set without grossAnnualSalary");
        }
    }

    /**
     * @return whether this experience carries a member-declared gross annual salary — the
     *         trigger condition for {@link ProfessionalProfile#deriveCompensationDeclarations(String)}.
     */
    public boolean hasGrossAnnualSalary() {
        return grossAnnualSalary != null;
    }
}
