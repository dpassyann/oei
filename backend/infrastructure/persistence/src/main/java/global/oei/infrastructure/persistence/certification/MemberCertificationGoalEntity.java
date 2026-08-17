package global.oei.infrastructure.persistence.certification;

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

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "member_certification_goal")
public class MemberCertificationGoalEntity extends BaseAudit {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "recognized_certification_id", nullable = false)
    private String recognizedCertificationId;

    @Column(name = "status", nullable = false, length = 20)
    private String status;
}
