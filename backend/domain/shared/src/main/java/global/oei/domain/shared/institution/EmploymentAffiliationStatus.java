package global.oei.domain.shared.institution;

/**
 * Domain-level lifecycle of an {@link EmploymentAffiliation}. The OpenAPI contract exposes
 * this same lifecycle through two different lexicons depending on the viewpoint —
 * {@code EmploymentAffiliationDTO.status} (member-facing: {@code PENDING/VERIFIED/REJECTED/ENDED})
 * vs. {@code MemberInstitutionAffiliationDTO.status} (institution-facing:
 * {@code PENDING/APPROVED/REJECTED/ENDED}) — so {@link #ACCEPTED} is mapped to {@code VERIFIED}
 * or {@code APPROVED} at the DTO-mapping boundary, never inside the domain itself.
 */
public enum EmploymentAffiliationStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    ENDED
}
