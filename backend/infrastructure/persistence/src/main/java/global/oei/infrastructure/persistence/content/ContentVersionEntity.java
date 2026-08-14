package global.oei.infrastructure.persistence.content;

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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "content_version")
public class ContentVersionEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "content_id", nullable = false)
    private UUID contentId;

    @Column(name = "version", nullable = false)
    private String version;

    @Column(name = "language", nullable = false)
    private String language;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "body", nullable = false)
    private String body;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "front_matter_json", columnDefinition = "jsonb")
    private String frontMatterJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "author_ids_json", columnDefinition = "jsonb")
    private String authorIdsJson;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
