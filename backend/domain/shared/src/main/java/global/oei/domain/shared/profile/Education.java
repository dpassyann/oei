package global.oei.domain.shared.profile;

import java.time.LocalDate;
import java.util.Objects;

/**
 * An education entry listed on a {@link ProfessionalProfile}.
 */
public record Education(
        String id, String institution, String program, LocalDate startDate, LocalDate endDate, String description) {

    public Education {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(institution, "institution must not be null");
        Objects.requireNonNull(program, "program must not be null");
        Objects.requireNonNull(startDate, "startDate must not be null");
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("endDate must not be before startDate");
        }
    }
}
