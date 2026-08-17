package global.oei.infrastructure.persistence.content;

import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.content.ContentTranslation;
import global.oei.domain.shared.content.ContentTranslationPort;
import global.oei.domain.shared.content.ContentTranslationStatus;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentTranslationPersistenceAdapter implements ContentTranslationPort {

    private final ContentTranslationRepository repository;

    @Override
    @Transactional
    public ContentTranslation save(final ContentTranslation translation) {
        final ContentTranslationEntity entity = new ContentTranslationEntity(
                UUID.fromString(translation.id()),
                translation.contentVersionId() == null ? null : UUID.fromString(translation.contentVersionId()),
                translation.language(), translation.status().name(), translation.translatorId(), translation.validatedBy(),
                translation.validatedAt());
        repository.save(entity);
        return translation;
    }

    @Override
    public Optional<ContentTranslation> findByContentVersionIdAndLanguage(final String contentVersionId, final String language) {
        return repository.findByContentVersionIdAndLanguage(UUID.fromString(contentVersionId), language)
                .map(ContentTranslationPersistenceAdapter::toDomain);
    }

    private static ContentTranslation toDomain(final ContentTranslationEntity entity) {
        return new ContentTranslation(
                entity.getId().toString(), entity.getContentVersionId() == null ? null : entity.getContentVersionId().toString(),
                entity.getLanguage(), ContentTranslationStatus.valueOf(entity.getStatus()), entity.getTranslatorId(),
                entity.getValidatedBy(), entity.getValidatedAt());
    }
}
