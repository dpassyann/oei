package global.oei.infrastructure.persistence.cv;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import global.oei.infrastructure.persistence.config.audit.BaseAudit;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * JPA persistence model for a member's {@code Cv}.
 *
 * <p>Stored as a single {@code jsonb} blob ({@link #cvJson}) rather than exploded into child
 * tables for sections/translations — same "big object, replaced wholesale" strategy as
 * {@code ProfessionalProfileEntity} (see its Javadoc, ADR 0002); the OpenAPI contract's
 * finer-grained per-section/per-translation operations are implemented as pure mutations on
 * the {@code global.oei.domain.shared.cv.Cv} aggregate, then persisted wholesale here.
 * {@link #memberId} and {@link #status} are denormalized as their own columns purely so
 * {@code listMyCvs}/lookups stay cheaply queryable/indexable without parsing the JSON.</p>
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "cv")
public class CvEntity extends BaseAudit {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "status", nullable = false, length = 10)
    private String status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "cv_json", nullable = false, columnDefinition = "jsonb")
    private String cvJson;
}
