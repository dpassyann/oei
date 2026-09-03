package global.oei.infrastructure.persistence.profileimport;

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

import global.oei.infrastructure.persistence.config.audit.BaseAudit;

/**
 * JPA persistence model for a {@code ProfileImport} pipeline session (see
 * {@code global.oei.domain.shared.profileimport.ProfileImport}'s Javadoc for why this is a
 * distinct concept from {@code CvEntity}). Unlike {@code Cv}/{@code ProfessionalProfile}, this
 * aggregate has no nested collections worth storing as a single jsonb blob — every field maps
 * to its own column, kept cheaply queryable (e.g. status polling, future cleanup jobs for
 * expired sessions).
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "profile_import")
public class ProfileImportEntity extends BaseAudit {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "source", nullable = false, length = 20)
    private String source;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "status_updated_at", nullable = false)
    private Instant statusUpdatedAt;

    @Column(name = "error_code")
    private String errorCode;
}
