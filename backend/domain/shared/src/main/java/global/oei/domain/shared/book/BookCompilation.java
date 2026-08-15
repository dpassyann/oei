package global.oei.domain.shared.book;

import java.util.List;
import java.util.Objects;

/**
 * A compilation of several CMS contents into a book (table of contents, optional cover/ISBN).
 * Rendering to PDF is handled separately — see {@code RenderBookCompilationService}'s Javadoc.
 */
public record BookCompilation(
        String id, String title, List<String> contentIds, String coverAssetId, String isbn, List<String> tableOfContents,
        String version) {

    public BookCompilation {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(title, "title must not be null");
        contentIds = List.copyOf(contentIds == null ? List.of() : contentIds);
        tableOfContents = List.copyOf(tableOfContents == null ? List.of() : tableOfContents);
        Objects.requireNonNull(version, "version must not be null");
    }
}
