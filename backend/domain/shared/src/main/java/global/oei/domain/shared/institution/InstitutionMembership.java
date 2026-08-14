package global.oei.domain.shared.institution;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * A member's internal role within an institution's team (owner/admin/HR/...), distinct from
 * {@link EmploymentAffiliation} (which only records that a member is employed there).
 */
public record InstitutionMembership(
        MemberId memberId, InstitutionId institutionId, InstitutionRole role, Instant grantedAt, String grantedBy) {

    public InstitutionMembership {
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(institutionId, "institutionId must not be null");
        Objects.requireNonNull(role, "role must not be null");
    }

    /**
     * @return a new instance with {@link #role()} replaced; every other field unchanged
     */
    public InstitutionMembership withRole(final InstitutionRole newRole) {
        return new InstitutionMembership(memberId, institutionId, newRole, grantedAt, grantedBy);
    }
}
