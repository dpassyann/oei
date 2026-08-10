package org.oei.domain.shared.member;

import java.time.Instant;
import java.util.Objects;

/**
 * A registered OEI member — the identity/profile aggregate root.
 *
 * <p>Kept intentionally minimal at this bootstrap stage: professional profile,
 * certifications, badges, etc. live in their own future aggregates and reference
 * a member only by {@link MemberId}.</p>
 *
 * @param id          stable identity
 * @param publicSlug  URL-friendly identifier used by the public profile/digital card
 * @param displayName name shown across the platform
 * @param legalName   legal name, used for official documents (CV, certificates)
 * @param locale      preferred locale (e.g. {@code "fr"}, {@code "en"})
 * @param country     ISO country code of residence
 * @param createdAt   registration timestamp
 */
public record Member(
        MemberId id,
        String publicSlug,
        String displayName,
        String legalName,
        String locale,
        String country,
        Instant createdAt) {

    public Member {
        Objects.requireNonNull(id, "id must not be null");
        requireNonBlank(publicSlug, "publicSlug");
        requireNonBlank(displayName, "displayName");
        requireNonBlank(legalName, "legalName");
        requireNonBlank(locale, "locale");
        requireNonBlank(country, "country");
        Objects.requireNonNull(createdAt, "createdAt must not be null");
    }

    private static void requireNonBlank(final String value, final String fieldName) {
        Objects.requireNonNull(value, fieldName + " must not be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
    }
}
