package global.oei.domain.shared.profile;

import java.util.Objects;

import global.oei.domain.shared.network.CompensationPeriod;

/**
 * A member's own current compensation figure. Deliberately private, always: never part of
 * any public-facing schema, never rendered on the digital business card/CV/member
 * directory. Mirrors the frontend's {@code CurrentCompensation} (professional-profile.ts).
 *
 * <p>Distinct from — and, in this iteration, not automatically wired into —
 * {@code compensation_declaration} (the anonymized, per-graph-node aggregate dataset behind
 * {@code SalaryInsightPort}): a member's own point-in-time figure here is not yet attached to
 * a specific expertise domain/topic/certification node, so it does not automatically feed
 * that aggregate. See {@code ProfessionalProfile}'s class Javadoc.</p>
 */
public record CurrentCompensation(double amount, String currency, CompensationPeriod period, String country) {

    public CurrentCompensation {
        Objects.requireNonNull(currency, "currency must not be null");
        if (currency.isBlank()) {
            throw new IllegalArgumentException("currency must not be blank");
        }
        Objects.requireNonNull(period, "period must not be null");
    }
}
