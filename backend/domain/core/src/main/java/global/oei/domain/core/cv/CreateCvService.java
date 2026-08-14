package global.oei.domain.core.cv;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.cv.CreateCvUseCase;
import global.oei.domain.shared.cv.Cv;
import global.oei.domain.shared.cv.CvPort;
import global.oei.domain.shared.cv.CvStatus;
import global.oei.domain.shared.member.MemberId;

/**
 * Enforces the "always starts blank" invariant documented on {@link CreateCvUseCase}: every
 * CV this service creates starts {@link CvStatus#DRAFT} with an empty section list,
 * regardless of what the caller submitted.
 */
public class CreateCvService implements CreateCvUseCase {

    private final CvPort cvPort;

    public CreateCvService(final CvPort cvPort) {
        this.cvPort = Objects.requireNonNull(cvPort, "cvPort must not be null");
    }

    @Override
    public Cv execute(final MemberId memberId, final String templateId, final String sourceLanguage) {
        final Cv cv = new Cv(UUID.randomUUID().toString(), memberId, templateId, sourceLanguage, CvStatus.DRAFT, List.of());
        return cvPort.save(cv);
    }
}
