package global.oei.domain.shared.cv;

import java.util.List;

/**
 * Inbound port: trigger a PDF render of {@code cv}. See {@link PdfGenerationJobStatus}'s and
 * {@link PdfGenerationJob}'s Javadoc — this is mocked in this iteration (no real HTML/CSS
 * rendering engine is wired), same posture as {@code CreateWalletPassUseCase}.
 */
public interface RenderCvUseCase {

    PdfGenerationJob execute(Cv cv, String language, List<String> includeBadges);
}
