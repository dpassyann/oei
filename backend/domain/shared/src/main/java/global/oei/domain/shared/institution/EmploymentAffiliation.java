package global.oei.domain.shared.institution;

import java.time.Instant;
import java.util.Objects;

import global.oei.domain.shared.member.MemberId;

/**
 * Links a member to an institution as an employee. Requested by the member
 * ({@code requestEmploymentAffiliation}), decided by the institution's affiliation validator
 * ({@code approveInstitutionAffiliation}/{@code rejectInstitutionAffiliation}), and later
 * possibly ended ({@code endInstitutionAffiliation}).
 */
public record EmploymentAffiliation(
        String id,
        MemberId memberId,
        InstitutionId institutionId,
        EmploymentAffiliationVerificationMethod verificationMethod,
        EmploymentAffiliationStatus status,
        Instant requestedAt,
        Instant startedAt,
        Instant endedAt,
        Instant decidedAt,
        String decidedBy) {

    public EmploymentAffiliation {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(memberId, "memberId must not be null");
        Objects.requireNonNull(institutionId, "institutionId must not be null");
        Objects.requireNonNull(verificationMethod, "verificationMethod must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }

    /**
     * @return a new instance moved to {@link EmploymentAffiliationStatus#ACCEPTED}, or throws
     *         if not currently {@link EmploymentAffiliationStatus#PENDING}
     */
    public EmploymentAffiliation approve(final String decidedBy, final Instant now) {
        requirePending();
        return new EmploymentAffiliation(
                id, memberId, institutionId, verificationMethod, EmploymentAffiliationStatus.ACCEPTED, requestedAt,
                now, endedAt, now, decidedBy);
    }

    /**
     * @return a new instance moved to {@link EmploymentAffiliationStatus#REJECTED}, or throws
     *         if not currently {@link EmploymentAffiliationStatus#PENDING}
     */
    public EmploymentAffiliation reject(final String decidedBy, final Instant now) {
        requirePending();
        return new EmploymentAffiliation(
                id, memberId, institutionId, verificationMethod, EmploymentAffiliationStatus.REJECTED, requestedAt,
                startedAt, endedAt, now, decidedBy);
    }

    /**
     * @return a new instance moved to {@link EmploymentAffiliationStatus#ENDED}
     */
    public EmploymentAffiliation end(final Instant now) {
        return new EmploymentAffiliation(
                id, memberId, institutionId, verificationMethod, EmploymentAffiliationStatus.ENDED, requestedAt,
                startedAt, now, decidedAt, decidedBy);
    }

    private void requirePending() {
        if (status != EmploymentAffiliationStatus.PENDING) {
            throw new IllegalStateException("only a PENDING affiliation request can be decided, was " + status);
        }
    }
}
