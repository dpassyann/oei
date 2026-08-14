package global.oei.domain.shared.cv;

/**
 * Outbound port for persisting {@link PdfGenerationJob}s.
 */
public interface PdfGenerationJobPort {

    PdfGenerationJob save(PdfGenerationJob job);
}
