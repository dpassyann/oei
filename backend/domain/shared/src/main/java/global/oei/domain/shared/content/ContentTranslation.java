package global.oei.domain.shared.content;

import java.time.Instant;
import java.util.Objects;

/**
 * A translation of a {@link ContentVersion} into another language.
 */
public record ContentTranslation(
        String id,
        String contentVersionId,
        String language,
        ContentTranslationStatus status,
        String translatorId,
        String validatedBy,
        Instant validatedAt) {

    public ContentTranslation {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(language, "language must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }

    /**
     * @return a new instance moved to {@link ContentTranslationStatus#VALIDATED}
     */
    public ContentTranslation validate(final String validatedBy, final Instant now) {
        return new ContentTranslation(id, contentVersionId, language, ContentTranslationStatus.VALIDATED, translatorId, validatedBy, now);
    }
}
