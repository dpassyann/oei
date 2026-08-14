package global.oei.application.web.resource.institution.adapter;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.institution.EmploymentAffiliation;
import global.oei.domain.shared.institution.Institution;
import global.oei.domain.shared.institution.InstitutionAuditLog;
import global.oei.domain.shared.institution.InstitutionBadgeProposal;
import global.oei.domain.shared.institution.InstitutionDashboard;
import global.oei.domain.shared.institution.InstitutionInvitation;
import global.oei.domain.shared.institution.InstitutionMembership;
import global.oei.domain.shared.institution.InstitutionOpportunity;
import global.oei.domain.shared.institution.InstitutionOpportunityType;
import global.oei.domain.shared.institution.InstitutionPublication;
import global.oei.domain.shared.institution.InstitutionPublicationType;
import global.oei.domain.shared.institution.InstitutionRole;
import global.oei.domain.shared.institution.Partnership;
import global.oei.domain.shared.member.MemberId;

/**
 * Adapter for the whole Institution bounded context (the institution's own team space,
 * {@code /api/institution/v1/**}), plus the member- and public-facing operations that share
 * its aggregates ({@code EmploymentAffiliation}, public institution pages).
 */
public interface InstitutionAdapter {

    // --- account ---
    Institution getMyInstitution();

    Institution updateMyInstitution(Institution submitted);

    Optional<Partnership> getMyPartnership();

    // --- roles ---
    List<InstitutionMembership> listRoleAssignments();

    Optional<InstitutionMembership> updateRoleAssignment(String memberId, InstitutionRole role);

    void removeRoleAssignment(String memberId);

    // --- invitations ---
    List<InstitutionInvitation> listInvitations();

    InstitutionInvitation createInvitation(String email, InstitutionRole role);

    Optional<InstitutionInvitation> revokeInvitation(String id);

    // --- members & affiliations (institution side) ---
    List<EmploymentAffiliation> listAcceptedAffiliations();

    List<EmploymentAffiliation> listAffiliationRequests();

    Optional<EmploymentAffiliation> approveAffiliation(String id);

    Optional<EmploymentAffiliation> rejectAffiliation(String id);

    Optional<EmploymentAffiliation> endAffiliation(String id);

    // --- dashboard ---
    InstitutionDashboard getDashboard();

    // --- publications ---
    List<InstitutionPublication> listPublications();

    InstitutionPublication createPublication(InstitutionPublicationType type, String title, String body);

    Optional<InstitutionPublication> getPublication(String id);

    Optional<InstitutionPublication> updatePublication(String id, InstitutionPublicationType type, String title, String body);

    Optional<InstitutionPublication> submitPublication(String id);

    // --- opportunities ---
    List<InstitutionOpportunity> listOpportunities();

    InstitutionOpportunity createOpportunity(InstitutionOpportunityType type, String title, String description, Instant expiresAt);

    Optional<InstitutionOpportunity> updateOpportunity(
            String id, InstitutionOpportunityType type, String title, String description, Instant expiresAt);

    Optional<InstitutionOpportunity> closeOpportunity(String id);

    // --- recognition ---
    List<InstitutionBadgeProposal> listBadgeProposals();

    InstitutionBadgeProposal createBadgeProposal(MemberId memberId, String proposedBadgeCode, String justification);

    // --- audit ---
    List<InstitutionAuditLog> listAuditLog();

    // --- member-side affiliation ---
    List<EmploymentAffiliation> listMyEmploymentAffiliations();

    EmploymentAffiliation requestEmploymentAffiliation(String institutionId);

    // --- public ---
    Optional<Institution> getPublicInstitution(String publicSlug);

    Optional<Partnership> getPublicPartnership(String publicSlug);

    List<InstitutionPublication> listPublicInstitutionPublications(String publicSlug);

    List<InstitutionOpportunity> listPublicInstitutionOpportunities(String publicSlug);

    // --- admin governance (/api/admin/v1/institutions, /api/admin/v1/audit-log) ---

    List<Institution> listAllInstitutions();

    Institution createInstitution(
            String legalName, String publicName, String country, String logoUrl, String description, List<String> emailDomains);

    Optional<Institution> approveInstitution(String id);

    Optional<Institution> activateInstitution(String id);

    Optional<Institution> suspendInstitution(String id);

    Optional<Institution> revokeInstitution(String id, String reason);

    /**
     * Marks the institution's {@link Partnership} as verified (documents/convention
     * checked) — see {@code Partnership#verified()}. Creates a {@code PROSPECT} partnership
     * record first if none exists yet.
     */
    Optional<Institution> verifyInstitution(String id);

    Optional<Partnership> updatePartnership(
            String id, global.oei.domain.shared.institution.PartnershipLevel level, boolean verified, Instant startedAt, Instant endsAt,
            String agreementDocumentUrl);

    List<InstitutionAuditLog> listAllAuditLog();
}
