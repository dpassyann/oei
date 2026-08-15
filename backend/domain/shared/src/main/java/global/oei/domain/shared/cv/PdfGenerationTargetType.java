package global.oei.domain.shared.cv;

/**
 * What a {@link PdfGenerationJob} renders, mirrored one-to-one on the OEI OpenAPI contract
 * ({@code PdfGenerationJob.targetType} enum). {@link #CV} (see {@code RenderCvService}) and
 * {@link #BOOK} (see {@code RenderBookCompilationService}) are both mocked in this iteration.
 */
public enum PdfGenerationTargetType {
    CV,
    BOOK
}
