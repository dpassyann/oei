package global.oei.domain.shared.book;

import java.util.Optional;

/**
 * Outbound port for {@link BookCompilation}.
 */
public interface BookCompilationPort {

    BookCompilation save(BookCompilation compilation);

    Optional<BookCompilation> findById(String id);
}
