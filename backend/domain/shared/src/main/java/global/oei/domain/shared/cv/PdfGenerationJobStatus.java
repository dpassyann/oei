package global.oei.domain.shared.cv;

/**
 * Lifecycle of a {@link PdfGenerationJob}, mirrored one-to-one on the OEI OpenAPI contract
 * ({@code PdfGenerationJobStatus} enum). In this iteration every job created by
 * {@code RenderCvService} completes synchronously as {@link #DONE} — see that class's
 * Javadoc on why (no real HTML/CSS-to-PDF rendering engine is wired yet, mocked explicitly,
 * same posture as {@code WalletPass}).
 */
public enum PdfGenerationJobStatus {
    QUEUED,
    PROCESSING,
    DONE,
    FAILED
}
