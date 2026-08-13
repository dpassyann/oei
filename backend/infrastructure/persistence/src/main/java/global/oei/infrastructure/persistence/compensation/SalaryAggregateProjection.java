package global.oei.infrastructure.persistence.compensation;

import java.math.BigDecimal;

/**
 * Spring Data JPA interface-based projection for the raw aggregate query in
 * {@link CompensationDeclarationRepository#aggregate}. {@code currency}/{@code period} are
 * read via {@code MAX(...)} in the query, assuming (as the demo dataset guarantees) a single
 * currency/period per node — see {@code SalaryInsightPersistenceAdapter}.
 */
public interface SalaryAggregateProjection {

    BigDecimal getLow();

    BigDecimal getHigh();

    long getSampleSize();

    String getCurrency();

    String getPeriod();
}
