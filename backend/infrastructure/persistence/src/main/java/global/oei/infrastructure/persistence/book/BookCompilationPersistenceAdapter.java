package global.oei.infrastructure.persistence.book;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.book.BookCompilation;
import global.oei.domain.shared.book.BookCompilationPort;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookCompilationPersistenceAdapter implements BookCompilationPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final BookCompilationRepository repository;

    @Override
    @Transactional
    public BookCompilation save(final BookCompilation compilation) {
        final BookCompilationEntity entity = new BookCompilationEntity(
                UUID.fromString(compilation.id()), compilation.title(), toJson(compilation.contentIds()),
                compilation.coverAssetId() == null ? null : UUID.fromString(compilation.coverAssetId()), compilation.isbn(),
                toJson(compilation.tableOfContents()), compilation.version());
        repository.save(entity);
        return compilation;
    }

    @Override
    public Optional<BookCompilation> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(BookCompilationPersistenceAdapter::toDomain);
    }

    @SneakyThrows
    private static BookCompilation toDomain(final BookCompilationEntity entity) {
        final List<String> contentIds = fromJson(entity.getContentIdsJson());
        final List<String> tableOfContents = fromJson(entity.getTableOfContentsJson());
        return new BookCompilation(
                entity.getId().toString(), entity.getTitle(), contentIds,
                entity.getCoverAssetId() == null ? null : entity.getCoverAssetId().toString(), entity.getIsbn(), tableOfContents,
                entity.getVersion());
    }

    @SneakyThrows
    private static List<String> fromJson(final String json) {
        if (json == null) {
            return List.of();
        }
        return OBJECT_MAPPER.readValue(json, OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, String.class));
    }

    @SneakyThrows
    private static String toJson(final List<String> values) {
        return OBJECT_MAPPER.writeValueAsString(values);
    }
}
