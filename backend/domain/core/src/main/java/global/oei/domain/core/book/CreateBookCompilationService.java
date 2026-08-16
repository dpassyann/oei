package global.oei.domain.core.book;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import global.oei.domain.shared.book.BookCompilation;
import global.oei.domain.shared.book.BookCompilationPort;
import global.oei.domain.shared.book.CreateBookCompilationUseCase;
import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Compiles a {@link BookCompilation}'s table of contents from the titles of the referenced
 * CMS {@link Content} items (via {@link ContentPort}, best-effort: any {@code contentId} that
 * does not resolve is simply skipped rather than failing the whole compilation).
 */
@Slf4j
@RequiredArgsConstructor
public class CreateBookCompilationService implements CreateBookCompilationUseCase {

    private static final String INITIAL_VERSION = "1.0";

    @NonNull
    private final BookCompilationPort bookCompilationPort;
    @NonNull
    private final ContentPort contentPort;

    @Override
    public BookCompilation execute(final String title, final List<String> contentIds, final String coverAssetId, final String isbn) {
        log.debug("CreateBookCompilationService: execute called");
        final List<String> tableOfContents = contentIds.stream()
                .map(contentPort::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(Content::title)
                .toList();
        final BookCompilation compilation = new BookCompilation(
                UUID.randomUUID().toString(), title, contentIds, coverAssetId, isbn, tableOfContents, INITIAL_VERSION);
        return bookCompilationPort.save(compilation);
    }
}
