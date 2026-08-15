package global.oei.domain.shared.book;

import java.util.List;

/**
 * Inbound port: compile several CMS contents into a {@link BookCompilation}.
 */
public interface CreateBookCompilationUseCase {

    BookCompilation execute(String title, List<String> contentIds, String coverAssetId, String isbn);
}
