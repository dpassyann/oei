package global.oei.infrastructure.persistence.content;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import tools.jackson.databind.ObjectMapper;

import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentGovernance;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentSourceType;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentWorkflowStatus;

/**
 * See {@link ContentPort}'s Javadoc: {@link #search} filters {@link #findAll()} in memory,
 * including by the CURRENT VERSION's language (fetched from {@link ContentVersionRepository}
 * per candidate) — real and correct, not indexed.
 */
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentPersistenceAdapter implements ContentPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final ContentRepository repository;
    private final ContentVersionRepository versionRepository;

    @Override
    @Transactional
    public Content save(final Content content) {
        final ContentEntity entity = new ContentEntity(
                UUID.fromString(content.id()), content.type().name(), content.slug(), content.sourceType().name(), content.title(),
                toJson(content.tags()), content.governance() == null ? null : content.governance().approvalRequired(),
                content.governance() == null ? null : content.governance().decisionId(),
                content.currentVersionId() == null ? null : UUID.fromString(content.currentVersionId()), content.status().name());
        repository.save(entity);
        return content;
    }

    @Override
    public Optional<Content> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(ContentPersistenceAdapter::toDomain);
    }

    @Override
    public List<Content> findAll() {
        return repository.findAll().stream().map(ContentPersistenceAdapter::toDomain).toList();
    }

    @Override
    public List<Content> search(
            final ContentType type, final ContentWorkflowStatus status, final String lang, final String tag, final String q) {
        return findAll().stream()
                .filter(content -> type == null || content.type() == type)
                .filter(content -> status == null || content.status() == status)
                .filter(content -> tag == null || content.tags().contains(tag))
                .filter(content -> lang == null || matchesLanguage(content, lang))
                .filter(content -> q == null || q.isBlank() || content.title().toLowerCase().contains(q.toLowerCase()))
                .toList();
    }

    private boolean matchesLanguage(final Content content, final String lang) {
        if (content.currentVersionId() == null) {
            return false;
        }
        return versionRepository.findById(UUID.fromString(content.currentVersionId()))
                .map(version -> lang.equals(version.getLanguage()))
                .orElse(false);
    }

    @SneakyThrows
    private static Content toDomain(final ContentEntity entity) {
        final List<String> tags = entity.getTagsJson() == null
                ? List.of()
                : OBJECT_MAPPER.readValue(entity.getTagsJson(), OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, String.class));
        final ContentGovernance governance = entity.getGovernanceApprovalRequired() == null
                ? null
                : new ContentGovernance(entity.getGovernanceApprovalRequired(), entity.getGovernanceDecisionId());
        return new Content(
                entity.getId().toString(), ContentType.valueOf(entity.getType()), entity.getSlug(),
                ContentSourceType.valueOf(entity.getSourceType()), entity.getTitle(), tags, governance,
                entity.getCurrentVersionId() == null ? null : entity.getCurrentVersionId().toString(),
                ContentWorkflowStatus.valueOf(entity.getStatus()));
    }

    @SneakyThrows
    private static String toJson(final List<String> tags) {
        return OBJECT_MAPPER.writeValueAsString(tags);
    }
}
