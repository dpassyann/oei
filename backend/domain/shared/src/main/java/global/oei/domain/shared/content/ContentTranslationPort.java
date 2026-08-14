package global.oei.domain.shared.content;

import java.util.Optional;

/**
 * Outbound port for {@link ContentTranslation}.
 */
public interface ContentTranslationPort {

    ContentTranslation save(ContentTranslation translation);

    Optional<ContentTranslation> findByContentVersionIdAndLanguage(String contentVersionId, String language);
}
