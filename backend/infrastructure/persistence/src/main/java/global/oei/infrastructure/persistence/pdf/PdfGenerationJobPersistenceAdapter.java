package global.oei.infrastructure.persistence.pdf;

import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.cv.PdfGenerationJob;
import global.oei.domain.shared.cv.PdfGenerationJobPort;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PdfGenerationJobPersistenceAdapter implements PdfGenerationJobPort {

    private final PdfGenerationJobRepository repository;

    @Override
    @Transactional
    public PdfGenerationJob save(final PdfGenerationJob job) {
        final PdfGenerationJobEntity entity = new PdfGenerationJobEntity(
                UUID.fromString(job.id()),
                job.targetType().name(),
                job.targetId(),
                job.status().name(),
                job.resultUrl(),
                job.requestedAt(),
                job.completedAt());
        repository.save(entity);
        return job;
    }
}
