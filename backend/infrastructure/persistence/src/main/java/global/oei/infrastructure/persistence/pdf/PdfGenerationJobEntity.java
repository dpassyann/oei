package global.oei.infrastructure.persistence.pdf;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * JPA persistence model for a {@code PdfGenerationJob}. Every row produced in this iteration
 * is mocked (see {@code global.oei.domain.core.cv.RenderCvService}'s Javadoc): {@code status}
 * is always persisted as {@code DONE} with a placeholder {@code result_url}, never a real
 * rendered document.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "pdf_generation_job")
public class PdfGenerationJobEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "target_type", nullable = false, length = 10)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private String targetId;

    @Column(name = "status", nullable = false, length = 12)
    private String status;

    @Column(name = "result_url")
    private String resultUrl;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}
