package global.oei.domain.core.cv;

import java.util.List;
import java.util.UUID;

import global.oei.domain.shared.cv.CreateCvUseCase;
import global.oei.domain.shared.cv.Cv;
import global.oei.domain.shared.cv.CvPort;
import global.oei.domain.shared.cv.CvStatus;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Enforces the "always starts blank" invariant documented on {@link CreateCvUseCase}: every
 * CV this service creates starts {@link CvStatus#DRAFT} with an empty section list,
 * regardless of what the caller submitted.
 */
@Slf4j
@RequiredArgsConstructor
public class CreateCvService implements CreateCvUseCase {

    @NonNull
    private final CvPort cvPort;

    @Override
    public Cv execute(final MemberId memberId, final String templateId, final String sourceLanguage) {
        log.debug("CreateCvService: execute called");
        final Cv cv = new Cv(UUID.randomUUID().toString(), memberId, templateId, sourceLanguage, CvStatus.DRAFT, List.of());
        return cvPort.save(cv);
    }
}
