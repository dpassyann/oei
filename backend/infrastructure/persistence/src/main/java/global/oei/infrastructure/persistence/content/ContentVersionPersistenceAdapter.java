package global.oei.infrastructure.persistence.content;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.content.ContentVersion;
import global.oei.domain.shared.content.ContentVersionPort;
import global.oei.domain.shared.content.ContentWorkflowStatus;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import tools.jackson.databind.ObjectMapper;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentVersionPersistenceAdapter implements ContentVersionPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final ContentVersionRepository repository;

    @Override
    @Transactional
    public ContentVersion save(final ContentVersion version) {
        final ContentVersionEntity entity = new ContentVersionEntity(
                UUID.fromString(version.id()), UUID.fromString(version.contentId()), version.version(), version.language(),
                version.title(), version.body(), toJson(version.frontMatter()), toJson(version.authorIds()),
                version.status().name(), version.createdAt());
        repository.save(entity);
        return version;
    }

    @Override
    public Optional<ContentVersion> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(ContentVersionPersistenceAdapter::toDomain);
    }

    @Override
    public List<ContentVersion> findByContentId(final String contentId) {
        return repository.findByContentId(UUID.fromString(contentId)).stream().map(ContentVersionPersistenceAdapter::toDomain).toList();
    }

    @SneakyThrows
    private static ContentVersion toDomain(final ContentVersionEntity entity) {
        final Map<String, Object> frontMatter =
                entity.getFrontMatterJson() == null ? Map.of() : OBJECT_MAPPER.readValue(entity.getFrontMatterJson(), Map.class);
        final List<String> authorIds = entity.getAuthorIdsJson() == null
                ? List.of()
                : OBJECT_MAPPER.readValue(entity.getAuthorIdsJson(), OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, String.class));
        return new ContentVersion(
                entity.getId().toString(), entity.getContentId().toString(), entity.getVersion(), entity.getLanguage(),
                entity.getTitle(), entity.getBody(), frontMatter, authorIds, ContentWorkflowStatus.valueOf(entity.getStatus()),
                entity.getCreatedAt());
    }

    @SneakyThrows
    private static String toJson(final Object value) {
        return OBJECT_MAPPER.writeValueAsString(value);
    }
}
