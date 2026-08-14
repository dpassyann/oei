package global.oei.domain.shared.institution;

import java.time.Instant;
import java.util.Objects;

public record Partnership(
        InstitutionId institutionId,
        PartnershipLevel level,
        boolean verified,
        Instant startedAt,
        Instant endsAt,
        String agreementDocumentUrl) {

    public Partnership {
        Objects.requireNonNull(institutionId, "institutionId must not be null");
        Objects.requireNonNull(level, "level must not be null");
    }
}
