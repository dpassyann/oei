package global.oei.domain.shared.cv;

/**
 * What a {@link PdfGenerationJob} renders, mirrored one-to-one on the OEI OpenAPI contract
 * ({@code PdfGenerationJob.targetType} enum). Only {@link #CV} is produced in this
 * iteration — {@code BOOK} (institution book compilation) is reserved for a later slice.
 */
public enum PdfGenerationTargetType {
    CV,
    BOOK
}
