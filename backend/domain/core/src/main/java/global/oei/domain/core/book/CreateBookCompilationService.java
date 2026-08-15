package global.oei.domain.core.book;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import global.oei.domain.shared.book.BookCompilation;
import global.oei.domain.shared.book.BookCompilationPort;
import global.oei.domain.shared.book.CreateBookCompilationUseCase;
import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentPort;

/**
 * Compiles a {@link BookCompilation}'s table of contents from the titles of the referenced
 * CMS {@link Content} items (via {@link ContentPort}, best-effort: any {@code contentId} that
 * does not resolve is simply skipped rather than failing the whole compilation).
 */
public class CreateBookCompilationService implements CreateBookCompilationUseCase {

    private static final String INITIAL_VERSION = "1.0";

    private final BookCompilationPort bookCompilationPort;
    private final ContentPort contentPort;

    public CreateBookCompilationService(final BookCompilationPort bookCompilationPort, final ContentPort contentPort) {
        this.bookCompilationPort = Objects.requireNonNull(bookCompilationPort, "bookCompilationPort must not be null");
        this.contentPort = Objects.requireNonNull(contentPort, "contentPort must not be null");
    }

    @Override
    public BookCompilation execute(final String title, final List<String> contentIds, final String coverAssetId, final String isbn) {
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
