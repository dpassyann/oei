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

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "content_publication")
public class ContentPublicationEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "content_version_id", nullable = false)
    private UUID contentVersionId;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt;

    @Column(name = "published_by")
    private String publishedBy;

    @Column(name = "channel")
    private String channel;
}
