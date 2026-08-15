package global.oei.infrastructure.persistence.git;

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
@Table(name = "git_synced_file")
public class GitSyncedFileEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "synchronization_id", nullable = false)
    private UUID synchronizationId;

    @Column(name = "path", nullable = false)
    private String path;

    @Column(name = "git_ref", nullable = false)
    private String gitRef;

    @Column(name = "commit_sha", nullable = false)
    private String commitSha;

    @Column(name = "raw_content", nullable = false)
    private String rawContent;
}
