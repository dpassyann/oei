package global.oei.infrastructure.persistence.institution;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "institution_membership")
@IdClass(InstitutionMembershipId.class)
public class InstitutionMembershipEntity {

    @Id
    @Column(name = "member_id", nullable = false, updatable = false)
    private UUID memberId;

    @Id
    @Column(name = "institution_id", nullable = false, updatable = false)
    private UUID institutionId;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "granted_at", nullable = false)
    private Instant grantedAt;

    @Column(name = "granted_by")
    private String grantedBy;
}
