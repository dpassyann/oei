package global.oei.infrastructure.persistence.institution;

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
@Table(name = "institution_badge_proposal")
public class InstitutionBadgeProposalEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "institution_id", nullable = false)
    private UUID institutionId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "proposed_badge_code", nullable = false)
    private String proposedBadgeCode;

    @Column(name = "justification", nullable = false)
    private String justification;

    @Column(name = "status", nullable = false)
    private String status;
}
