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
@Table(name = "content_approval")
public class ContentApprovalEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "content_version_id", nullable = false)
    private UUID contentVersionId;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "decision", nullable = false)
    private String decision;

    @Column(name = "comment")
    private String comment;

    @Column(name = "approver_id", nullable = false)
    private String approverId;

    @Column(name = "decided_at", nullable = false)
    private Instant decidedAt;
}
