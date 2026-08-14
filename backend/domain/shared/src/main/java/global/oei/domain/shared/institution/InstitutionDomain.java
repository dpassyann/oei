package global.oei.domain.shared.institution;

import java.time.Instant;
import java.util.Objects;

/**
 * An email domain claimed by an {@link Institution}, used to auto-suggest employment
 * affiliations ({@link EmploymentAffiliationVerificationMethod#EMAIL_DOMAIN}).
 */
public record InstitutionDomain(String id, String domain, boolean verified, Instant verifiedAt) {

    public InstitutionDomain {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(domain, "domain must not be null");
    }
}
