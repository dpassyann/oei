package global.oei.domain.core.cv;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.cv.Cv;
import global.oei.domain.shared.cv.PdfGenerationJob;
import global.oei.domain.shared.cv.PdfGenerationJobPort;
import global.oei.domain.shared.cv.PdfGenerationJobStatus;
import global.oei.domain.shared.cv.RenderCvUseCase;

/**
 * Mocked CV-to-PDF rendering: no real HTML/CSS layout engine (fonts, A4 pagination, QR code
 * embedding, badge illustrations) is wired in this iteration — there simply is no reasonable
 * "real engine" to stand up for this slice, exactly the same situation as
 * {@code CreateWalletPassService} for signed wallet passes. Every job produced here therefore
 * completes synchronously as {@link PdfGenerationJobStatus#DONE} with a clearly-labelled
 * placeholder {@link PdfGenerationJob#resultUrl()} (a {@code mock-cv-pdf} host) rather than a
 * real rendered document, and is never presented as an official/legally binding artifact.
 *
 * <p>{@code language}/{@code includeBadges} are accepted (and would drive the real renderer)
 * but have no effect on the mocked output — kept as parameters so the port/use-case contract
 * does not need to change once a real renderer is introduced.</p>
 */
@Slf4j
@RequiredArgsConstructor
public class RenderCvService implements RenderCvUseCase {

    @NonNull
    private final PdfGenerationJobPort pdfGenerationJobPort;

    @Override
    public PdfGenerationJob execute(final Cv cv, final String language, final List<String> includeBadges) {
        log.debug("RenderCvService: execute called");
        final String jobId = UUID.randomUUID().toString();
        final Instant now = Instant.now();
        final PdfGenerationJob job = new PdfGenerationJob(
                jobId,
                PdfGenerationTargetType.CV,
                cv.id(),
                PdfGenerationJobStatus.DONE,
                "https://mock-cv-pdf.oei.local/" + jobId + ".pdf",
                now,
                now);
        return pdfGenerationJobPort.save(job);
    }
}
