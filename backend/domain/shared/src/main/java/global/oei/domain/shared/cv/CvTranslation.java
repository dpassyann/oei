package global.oei.domain.shared.cv;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;

/**
 * A single-language translation of a {@link CvSection}'s {@link CvSection#content()}. Starts
 * {@link CvTranslationStatus#MACHINE_GENERATED} or {@link CvTranslationStatus#PENDING_VALIDATION}
 * depending on how it was produced (automatic vs. manually submitted); only reaches
 * {@link CvTranslationStatus#VALIDATED} through {@link #validate(String, Instant)} — never
 * exploitable in a PDF render before that (see the OpenAPI operation's own summary).
 */
public record CvTranslation(
        String id,
        String sectionId,
        String language,
        Map<String, Object> content,
        CvTranslationStatus status,
        Instant translatedAt,
        String validatedBy) {

    public CvTranslation {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(language, "language must not be null");
        if (language.isBlank()) {
            throw new IllegalArgumentException("language must not be blank");
        }
        Objects.requireNonNull(status, "status must not be null");
        content = content == null ? Map.of() : Map.copyOf(content);
    }

    /**
     * @return a new instance with {@link #status()} set to {@link CvTranslationStatus#VALIDATED}
     *         and {@link #validatedBy()} set to {@code validatedBy}; every other field unchanged
     */
    public CvTranslation validate(final String validatedBy) {
        return new CvTranslation(id, sectionId, language, content, CvTranslationStatus.VALIDATED, translatedAt, validatedBy);
    }
}
