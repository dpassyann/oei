package global.oei.domain.shared.profile;

import java.util.Objects;

/**
 * A spoken/written language proficiency listed on a {@link ProfessionalProfile}.
 */
public record LanguageProficiency(String language, LanguageLevel level) {

    public LanguageProficiency {
        Objects.requireNonNull(language, "language must not be null");
        if (language.isBlank()) {
            throw new IllegalArgumentException("language must not be blank");
        }
        Objects.requireNonNull(level, "level must not be null");
    }
}
