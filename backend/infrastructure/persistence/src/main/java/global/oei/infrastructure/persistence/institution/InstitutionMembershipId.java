package global.oei.infrastructure.persistence.institution;

import java.io.Serializable;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Composite primary key of {@link InstitutionMembershipEntity} (a member has at most one
 * internal role per institution).
 */
@Getter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionMembershipId implements Serializable {

    private UUID memberId;
    private UUID institutionId;
}
