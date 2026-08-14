package global.oei.domain.shared.cv;

import java.time.Instant;
import java.util.Objects;

/**
 * An asynchronous PDF rendering job (CV or, later, institution book compilation). See
 * {@link PdfGenerationJobStatus}'s Javadoc: in this iteration, every job produced by
 * {@code RenderCvService} is mocked — it completes synchronously as {@link
 * PdfGenerationJobStatus#DONE} with a placeholder {@link #resultUrl()}, never a real
 * rendered PDF. Never to be presented as an official/legally binding document.
 */
public record PdfGenerationJob(
        String id,
        PdfGenerationTargetType targetType,
        String targetId,
        PdfGenerationJobStatus status,
        String resultUrl,
        Instant requestedAt,
        Instant completedAt) {

    public PdfGenerationJob {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(targetType, "targetType must not be null");
        Objects.requireNonNull(targetId, "targetId must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }
}
