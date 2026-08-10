package org.oei.domain.shared.member;

import java.util.Objects;
import java.util.UUID;

/**
 * Identity of a {@link Member}, backed by a random UUID.
 *
 * <p>Value object: two instances wrapping the same {@link UUID} are equal.</p>
 */
public record MemberId(UUID value) {

    public MemberId {
        Objects.requireNonNull(value, "value must not be null");
    }

    /**
     * Creates a brand-new, randomly generated member identity.
     */
    public static MemberId newId() {
        return new MemberId(UUID.randomUUID());
    }

    /**
     * Parses a textual UUID representation into a {@link MemberId}.
     *
     * @throws IllegalArgumentException if {@code value} is not a valid UUID
     */
    public static MemberId of(final String value) {
        Objects.requireNonNull(value, "value must not be null");
        return new MemberId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
