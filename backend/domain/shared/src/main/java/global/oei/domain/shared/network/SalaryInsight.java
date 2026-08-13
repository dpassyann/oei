package global.oei.domain.shared.network;

import java.util.Objects;

/**
 * Anonymized salary range aggregated over member {@code CurrentCompensation} declarations
 * attached to one graph node (a domain, topic, or certification), optionally narrowed to one
 * country. Mirrors the frontend's {@code NetworkSalaryInsight} model
 * (network-salary-insight.model.ts).
 *
 * <p>{@link #sampleSize()} is the raw contributor count as reported by
 * {@link SalaryInsightPort} — it may be below {@link GetSalaryInsightUseCase#MIN_ANONYMIZED_SAMPLE_SIZE}.
 * Enforcing the anonymization threshold (never returning an insight built from too few
 * contributors) is {@link GetSalaryInsightUseCase}'s responsibility, not this value object's:
 * a {@code SalaryInsight} instance always faithfully represents whatever the port measured.</p>
 *
 * @param low        lower bound of the aggregated range
 * @param high       upper bound of the aggregated range
 * @param currency   ISO 4217 currency code shared by every aggregated declaration
 * @param period     {@link CompensationPeriod} shared by every aggregated declaration
 * @param sampleSize number of declarations aggregated into this range
 * @param country    free-text country the aggregate was narrowed to, or {@code null} for the
 *                   country-agnostic (global) aggregate
 */
public record SalaryInsight(
        double low, double high, String currency, CompensationPeriod period, int sampleSize, String country) {

    public SalaryInsight {
        Objects.requireNonNull(currency, "currency must not be null");
        if (currency.isBlank()) {
            throw new IllegalArgumentException("currency must not be blank");
        }
        Objects.requireNonNull(period, "period must not be null");
        if (sampleSize < 0) {
            throw new IllegalArgumentException("sampleSize must not be negative");
        }
        if (high < low) {
            throw new IllegalArgumentException("high must not be lower than low");
        }
    }
}
