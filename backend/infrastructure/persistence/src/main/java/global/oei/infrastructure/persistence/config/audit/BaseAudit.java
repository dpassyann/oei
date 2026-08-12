package global.oei.infrastructure.persistence.config.audit;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.Getter;

/**
 * Technical (JPA) audit trail shared by all persistence entities: creation/last-modification
 * timestamps and actors. Populated automatically by Spring Data JPA auditing
 * ({@code @EnableJpaAuditing}, see {@code PersistenceAuditingConfiguration}).
 *
 * <p>This is a purely technical audit — it is not a substitute for a business audit log
 * (e.g. {@code InstitutionAuditLog} from the OpenAPI contract) where the business itself
 * requires an immutable historical record.</p>
 *
 * <p>No {@code @Setter}: these fields are populated by {@link AuditingEntityListener} via
 * field access, never through application code.</p>
 */
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseAudit {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedDate
    @Column(name = "last_modified_at", nullable = false)
    private Instant lastModifiedAt;

    @LastModifiedBy
    @Column(name = "last_modified_by")
    private String lastModifiedBy;
}
