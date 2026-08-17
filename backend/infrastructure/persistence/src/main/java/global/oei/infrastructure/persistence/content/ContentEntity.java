package global.oei.infrastructure.persistence.content;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "content")
public class ContentEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "source_type", nullable = false)
    private String sourceType;

    @Column(name = "title", nullable = false)
    private String title;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags_json", columnDefinition = "jsonb")
    private String tagsJson;

    @Column(name = "governance_approval_required")
    private Boolean governanceApprovalRequired;

    @Column(name = "governance_decision_id")
    private String governanceDecisionId;

    @Column(name = "current_version_id")
    private UUID currentVersionId;

    @Column(name = "status", nullable = false)
    private String status;
}
