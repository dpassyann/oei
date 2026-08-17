package global.oei.application.web.resource.book;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.AdminBooksApi;
import global.oei.application.web.model.BookCompilationCreationDTO;
import global.oei.application.web.model.BookCompilationDTO;
import global.oei.application.web.model.PdfGenerationJobDTO;
import global.oei.application.web.resource.book.mapper.BookCompilationDtoMapper;
import global.oei.domain.shared.book.BookCompilationPort;
import global.oei.domain.shared.book.CreateBookCompilationUseCase;
import global.oei.domain.shared.book.RenderBookCompilationUseCase;

/**
 * Implements {@link AdminBooksApi}. See {@code RenderBookCompilationService}'s Javadoc for the
 * mocked rendering posture, mirroring {@code MemberCvApi}'s {@code renderCv}.
 */
@RestController
@RequiredArgsConstructor
public class AdminBooksResource implements AdminBooksApi {

    private final CreateBookCompilationUseCase createBookCompilationUseCase;
    private final RenderBookCompilationUseCase renderBookCompilationUseCase;
    private final BookCompilationPort bookCompilationPort;

    @Override
    public ResponseEntity<BookCompilationDTO> createBookCompilation(final BookCompilationCreationDTO creation) {
        final var compilation = createBookCompilationUseCase.execute(
                creation.getTitle(), creation.getContentIds(), creation.getCoverAssetId(),
                creation.getIsbn() == null ? null : creation.getIsbn().orElse(null));
        return ResponseEntity.status(HttpStatus.CREATED).body(BookCompilationDtoMapper.toDto(compilation));
    }

    @Override
    public ResponseEntity<PdfGenerationJobDTO> renderBookCompilation(final String id) {
        final var compilation = bookCompilationPort.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        final var job = renderBookCompilationUseCase.execute(compilation);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(BookCompilationDtoMapper.toDto(job));
    }
}
