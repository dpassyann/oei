package global.oei.domain.shared.cv;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * A single section of a {@link Cv} (identity block, one experience, one skill group, ...),
 * each independently translatable via {@link #translations()}.
 */
public record CvSection(
        String id,
        String cvId,
        CvSectionType type,
        int order,
        Map<String, Object> content,
        List<CvTranslation> translations) {

    public CvSection {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(type, "type must not be null");
        content = content == null ? Map.of() : Map.copyOf(content);
        translations = List.copyOf(translations == null ? List.of() : translations);
    }

    /**
     * @return a new instance with {@code translation} appended to {@link #translations()}
     *         (replacing any existing translation for the same {@link CvTranslation#language()});
     *         every other field unchanged
     */
    public CvSection addTranslation(final CvTranslation translation) {
        final List<CvTranslation> merged = new ArrayList<>(translations.stream()
                .filter(existing -> !existing.language().equals(translation.language()))
                .toList());
        merged.add(translation);
        return new CvSection(id, cvId, type, order, content, merged);
    }

    /**
     * @return a new instance with the translation matching {@code language} moved to
     *         {@link CvTranslationStatus#VALIDATED}, or empty if no such translation exists
     */
    public Optional<CvSection> validateTranslation(final String language, final String validatedBy) {
        boolean found = false;
        final List<CvTranslation> updated = new ArrayList<>(translations.size());
        for (final CvTranslation translation : translations) {
            if (translation.language().equals(language)) {
                updated.add(translation.validate(validatedBy));
                found = true;
            } else {
                updated.add(translation);
            }
        }
        return found ? Optional.of(new CvSection(id, cvId, type, order, content, updated)) : Optional.empty();
    }
}
