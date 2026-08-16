package global.oei.domain.core.book;

import java.time.Instant;
import java.util.UUID;

import global.oei.domain.shared.book.BookCompilation;
import global.oei.domain.shared.book.RenderBookCompilationUseCase;
import global.oei.domain.shared.cv.PdfGenerationJob;
import global.oei.domain.shared.cv.PdfGenerationJobPort;
import global.oei.domain.shared.cv.PdfGenerationJobStatus;
import global.oei.domain.shared.cv.PdfGenerationTargetType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Mocked book-to-PDF rendering: same posture as {@code RenderCvService} — no real HTML/CSS
 * layout engine is wired for pagination/typesetting a compiled book, so every job produced
 * here completes synchronously as {@link PdfGenerationJobStatus#DONE} with a clearly-labelled
 * placeholder {@link PdfGenerationJob#resultUrl()} (a {@code mock-book-pdf} host), never a
 * real rendered document.
 */
@Slf4j
@RequiredArgsConstructor
public class RenderBookCompilationService implements RenderBookCompilationUseCase {

    @NonNull
    private final PdfGenerationJobPort pdfGenerationJobPort;

    @Override
    public PdfGenerationJob execute(final BookCompilation compilation) {
        log.debug("RenderBookCompilationService: execute called");
        final String jobId = UUID.randomUUID().toString();
        final Instant now = Instant.now();
        final PdfGenerationJob job = new PdfGenerationJob(
                jobId, PdfGenerationTargetType.BOOK, compilation.id(), PdfGenerationJobStatus.DONE,
                "https://mock-book-pdf.oei.local/" + jobId + ".pdf", now, now);
        return pdfGenerationJobPort.save(job);
    }
}
