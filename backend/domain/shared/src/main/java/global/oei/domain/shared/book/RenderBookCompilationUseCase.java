package global.oei.domain.shared.book;

import global.oei.domain.shared.cv.PdfGenerationJob;

/**
 * Inbound port: render a {@link BookCompilation} to PDF. See {@code RenderBookCompilationService}'s
 * Javadoc — mocked exactly like {@code RenderCvUseCase}, reusing the same shared
 * {@link PdfGenerationJob} concept with {@code targetType} {@code BOOK}.
 */
public interface RenderBookCompilationUseCase {

    PdfGenerationJob execute(BookCompilation compilation);
}
