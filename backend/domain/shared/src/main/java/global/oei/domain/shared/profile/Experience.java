package global.oei.domain.shared.profile;

import java.time.LocalDate;
import java.util.Objects;

/**
 * @param isDemoData never persisted for real members — carried only so demo-seeded profiles
 *                   can be flagged honestly if ever rendered, mirroring the frontend's demo
 *                   data honesty rule.
 */
public record Experience(
        String id,
        String organization,
        String title,
        LocalDate startDate,
        LocalDate endDate,
        boolean current,
        String description,
        boolean isDemoData) {

    public Experience {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(organization, "organization must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(startDate, "startDate must not be null");
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("endDate must not be before startDate");
        }
    }
}
