package global.oei.domain.shared.institution;

import java.util.Objects;
import java.util.UUID;

/**
 * Identity of an {@link Institution}, backed by a random UUID (mirrors {@code MemberId}).
 */
public record InstitutionId(UUID value) {

    public InstitutionId {
        Objects.requireNonNull(value, "value must not be null");
    }

    public static InstitutionId newId() {
        return new InstitutionId(UUID.randomUUID());
    }

    public static InstitutionId of(final String value) {
        Objects.requireNonNull(value, "value must not be null");
        return new InstitutionId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
