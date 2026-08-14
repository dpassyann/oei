package global.oei.application.web.resource.institution.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.domain.shared.institution.CreateInstitutionBadgeProposalUseCase;
import global.oei.domain.shared.institution.CreateInstitutionInvitationUseCase;
import global.oei.domain.shared.institution.CreateInstitutionOpportunityUseCase;
import global.oei.domain.shared.institution.CreateInstitutionPublicationUseCase;
import global.oei.domain.shared.institution.CreateInstitutionUseCase;
import global.oei.domain.shared.institution.EmploymentAffiliation;
import global.oei.domain.shared.institution.EmploymentAffiliationPort;
import global.oei.domain.shared.institution.EmploymentAffiliationStatus;
import global.oei.domain.shared.institution.Institution;
import global.oei.domain.shared.institution.InstitutionAuditLog;
import global.oei.domain.shared.institution.InstitutionAuditLogPort;
import global.oei.domain.shared.institution.InstitutionBadgeProposal;
import global.oei.domain.shared.institution.InstitutionBadgeProposalPort;
import global.oei.domain.shared.institution.InstitutionDashboard;
import global.oei.domain.shared.institution.InstitutionDashboardPort;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionInvitation;
import global.oei.domain.shared.institution.InstitutionInvitationPort;
import global.oei.domain.shared.institution.InstitutionMembership;
import global.oei.domain.shared.institution.InstitutionMembershipPort;
import global.oei.domain.shared.institution.InstitutionOpportunity;
import global.oei.domain.shared.institution.InstitutionOpportunityPort;
import global.oei.domain.shared.institution.InstitutionOpportunityType;
import global.oei.domain.shared.institution.InstitutionPort;
import global.oei.domain.shared.institution.InstitutionPublication;
import global.oei.domain.shared.institution.InstitutionPublicationPort;
import global.oei.domain.shared.institution.InstitutionPublicationType;
import global.oei.domain.shared.institution.InstitutionRole;
import global.oei.domain.shared.institution.Partnership;
import global.oei.domain.shared.institution.PartnershipLevel;
import global.oei.domain.shared.institution.PartnershipPort;
import global.oei.domain.shared.institution.RequestEmploymentAffiliationUseCase;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of the Institution bounded context. Every institution-side
 * method resolves "my institution" strictly from the caller's {@code institutionId} JWT
 * claim (ADR 0002 Décision 2, multi-tenant isolation) — never from a client-supplied id.
 */
@Service
@RequiredArgsConstructor
public class InstitutionService implements InstitutionAdapter {

    private final SecurityContextPort securityContextPort;
    private final InstitutionPort institutionPort;
    private final PartnershipPort partnershipPort;
    private final InstitutionMembershipPort institutionMembershipPort;
    private final InstitutionInvitationPort institutionInvitationPort;
    private final CreateInstitutionInvitationUseCase createInstitutionInvitationUseCase;
    private final EmploymentAffiliationPort employmentAffiliationPort;
    private final RequestEmploymentAffiliationUseCase requestEmploymentAffiliationUseCase;
    private final InstitutionPublicationPort institutionPublicationPort;
    private final CreateInstitutionPublicationUseCase createInstitutionPublicationUseCase;
    private final InstitutionOpportunityPort institutionOpportunityPort;
    private final CreateInstitutionOpportunityUseCase createInstitutionOpportunityUseCase;
    private final InstitutionBadgeProposalPort institutionBadgeProposalPort;
    private final CreateInstitutionBadgeProposalUseCase createInstitutionBadgeProposalUseCase;
    private final InstitutionAuditLogPort institutionAuditLogPort;
    private final InstitutionDashboardPort institutionDashboardPort;
    private final CreateInstitutionUseCase createInstitutionUseCase;

    // --- account ---

    @Override
    public Institution getMyInstitution() {
        return institutionPort.findById(currentInstitutionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Override
    public Institution updateMyInstitution(final Institution submitted) {
        final Institution updated = institutionPort.save(getMyInstitution().withUpdatedProfile(submitted));
        audit("INSTITUTION_ACCOUNT_UPDATED", "Institution", updated.id().toString(), Map.of());
        return updated;
    }

    @Override
    public Optional<Partnership> getMyPartnership() {
        return partnershipPort.findByInstitutionId(currentInstitutionId());
    }

    // --- roles ---

    @Override
    public List<InstitutionMembership> listRoleAssignments() {
        return institutionMembershipPort.findByInstitutionId(currentInstitutionId());
    }

    @Override
    public Optional<InstitutionMembership> updateRoleAssignment(final String memberId, final InstitutionRole role) {
        final InstitutionId institutionId = currentInstitutionId();
        final MemberId targetMemberId = MemberId.of(memberId);
        final Optional<InstitutionMembership> existing = institutionMembershipPort.findByInstitutionIdAndMemberId(institutionId, targetMemberId);
        final InstitutionMembership updated = existing
                .map(membership -> membership.withRole(role))
                .orElseGet(() -> new InstitutionMembership(targetMemberId, institutionId, role, Instant.now(), currentMemberId().toString()));
        final InstitutionMembership saved = institutionMembershipPort.save(updated);
        audit("INSTITUTION_ROLE_UPDATED", "InstitutionMembership", memberId, Map.of("role", role.name()));
        return Optional.of(saved);
    }

    @Override
    public void removeRoleAssignment(final String memberId) {
        institutionMembershipPort.delete(currentInstitutionId(), MemberId.of(memberId));
        audit("INSTITUTION_ROLE_REMOVED", "InstitutionMembership", memberId, Map.of());
    }

    // --- invitations ---

    @Override
    public List<InstitutionInvitation> listInvitations() {
        return institutionInvitationPort.findByInstitutionId(currentInstitutionId());
    }

    @Override
    public InstitutionInvitation createInvitation(final String email, final InstitutionRole role) {
        final InstitutionInvitation invitation =
                createInstitutionInvitationUseCase.execute(currentInstitutionId(), email, role, currentMemberId().toString());
        audit("INVITATION_CREATED", "InstitutionInvitation", invitation.id(), Map.of("email", email));
        return invitation;
    }

    @Override
    public Optional<InstitutionInvitation> revokeInvitation(final String id) {
        return findOwnInvitation(id).map(invitation -> {
            final InstitutionInvitation revoked = institutionInvitationPort.save(invitation.revoke());
            audit("INVITATION_REVOKED", "InstitutionInvitation", id, Map.of());
            return revoked;
        });
    }

    // --- members & affiliations ---

    @Override
    public List<EmploymentAffiliation> listAcceptedAffiliations() {
        return employmentAffiliationPort.findByInstitutionIdAndStatus(currentInstitutionId(), EmploymentAffiliationStatus.ACCEPTED);
    }

    @Override
    public List<EmploymentAffiliation> listAffiliationRequests() {
        return employmentAffiliationPort.findByInstitutionId(currentInstitutionId());
    }

    @Override
    public Optional<EmploymentAffiliation> approveAffiliation(final String id) {
        return findOwnAffiliation(id).map(affiliation -> {
            final EmploymentAffiliation approved =
                    employmentAffiliationPort.save(affiliation.approve(currentMemberId().toString(), Instant.now()));
            audit("AFFILIATION_APPROVED", "EmploymentAffiliation", id, Map.of());
            return approved;
        });
    }

    @Override
    public Optional<EmploymentAffiliation> rejectAffiliation(final String id) {
        return findOwnAffiliation(id).map(affiliation -> {
            final EmploymentAffiliation rejected =
                    employmentAffiliationPort.save(affiliation.reject(currentMemberId().toString(), Instant.now()));
            audit("AFFILIATION_REJECTED", "EmploymentAffiliation", id, Map.of());
            return rejected;
        });
    }

    @Override
    public Optional<EmploymentAffiliation> endAffiliation(final String id) {
        return findOwnAffiliation(id).map(affiliation -> {
            final EmploymentAffiliation ended = employmentAffiliationPort.save(affiliation.end(Instant.now()));
            audit("AFFILIATION_ENDED", "EmploymentAffiliation", id, Map.of());
            return ended;
        });
    }

    // --- dashboard ---

    @Override
    public InstitutionDashboard getDashboard() {
        return institutionDashboardPort.compute(currentInstitutionId());
    }

    // --- publications ---

    @Override
    public List<InstitutionPublication> listPublications() {
        return institutionPublicationPort.findByInstitutionId(currentInstitutionId());
    }

    @Override
    public InstitutionPublication createPublication(final InstitutionPublicationType type, final String title, final String body) {
        return createInstitutionPublicationUseCase.execute(currentInstitutionId(), type, title, body, currentMemberId());
    }

    @Override
    public Optional<InstitutionPublication> getPublication(final String id) {
        return findOwnPublication(id);
    }

    @Override
    public Optional<InstitutionPublication> updatePublication(
            final String id, final InstitutionPublicationType type, final String title, final String body) {
        return findOwnPublication(id).map(publication -> institutionPublicationPort.save(publication.withContent(type, title, body)));
    }

    @Override
    public Optional<InstitutionPublication> submitPublication(final String id) {
        return findOwnPublication(id).map(publication -> {
            final InstitutionPublication submitted = institutionPublicationPort.save(publication.submit(Instant.now()));
            audit("PUBLICATION_SUBMITTED", "InstitutionPublication", id, Map.of());
            return submitted;
        });
    }

    // --- opportunities ---

    @Override
    public List<InstitutionOpportunity> listOpportunities() {
        return institutionOpportunityPort.findByInstitutionId(currentInstitutionId());
    }

    @Override
    public InstitutionOpportunity createOpportunity(
            final InstitutionOpportunityType type, final String title, final String description, final Instant expiresAt) {
        return createInstitutionOpportunityUseCase.execute(currentInstitutionId(), type, title, description, expiresAt);
    }

    @Override
    public Optional<InstitutionOpportunity> updateOpportunity(
            final String id, final InstitutionOpportunityType type, final String title, final String description, final Instant expiresAt) {
        return findOwnOpportunity(id).map(opportunity -> institutionOpportunityPort.save(opportunity.withContent(type, title, description, expiresAt)));
    }

    @Override
    public Optional<InstitutionOpportunity> closeOpportunity(final String id) {
        return findOwnOpportunity(id).map(opportunity -> {
            final InstitutionOpportunity closed = institutionOpportunityPort.save(opportunity.close());
            audit("OPPORTUNITY_CLOSED", "InstitutionOpportunity", id, Map.of());
            return closed;
        });
    }

    // --- recognition ---

    @Override
    public List<InstitutionBadgeProposal> listBadgeProposals() {
        return institutionBadgeProposalPort.findByInstitutionId(currentInstitutionId());
    }

    @Override
    public InstitutionBadgeProposal createBadgeProposal(final MemberId memberId, final String proposedBadgeCode, final String justification) {
        return createInstitutionBadgeProposalUseCase.execute(currentInstitutionId(), memberId, proposedBadgeCode, justification);
    }

    // --- audit ---

    @Override
    public List<InstitutionAuditLog> listAuditLog() {
        return institutionAuditLogPort.findByInstitutionId(currentInstitutionId());
    }

    // --- member-side affiliation ---

    @Override
    public List<EmploymentAffiliation> listMyEmploymentAffiliations() {
        return employmentAffiliationPort.findByMemberId(currentMemberId());
    }

    @Override
    public EmploymentAffiliation requestEmploymentAffiliation(final String institutionId) {
        return requestEmploymentAffiliationUseCase.execute(currentMemberId(), InstitutionId.of(institutionId));
    }

    // --- public ---

    @Override
    public Optional<Institution> getPublicInstitution(final String publicSlug) {
        return institutionPort.findByPublicSlug(publicSlug);
    }

    @Override
    public Optional<Partnership> getPublicPartnership(final String publicSlug) {
        return getPublicInstitution(publicSlug).flatMap(institution -> partnershipPort.findByInstitutionId(institution.id()));
    }

    @Override
    public List<InstitutionPublication> listPublicInstitutionPublications(final String publicSlug) {
        return getPublicInstitution(publicSlug)
                .map(institution -> institutionPublicationPort.findPublishedByInstitutionId(institution.id()))
                .orElseGet(List::of);
    }

    @Override
    public List<InstitutionOpportunity> listPublicInstitutionOpportunities(final String publicSlug) {
        return getPublicInstitution(publicSlug)
                .map(institution -> institutionOpportunityPort.findPublishedByInstitutionId(institution.id()))
                .orElseGet(List::of);
    }

    // --- admin governance ---

    @Override
    public List<Institution> listAllInstitutions() {
        return institutionPort.findAll();
    }

    @Override
    public Institution createInstitution(
            final String legalName, final String publicName, final String country, final String logoUrl, final String description,
            final List<String> emailDomains) {
        return createInstitutionUseCase.execute(legalName, publicName, country, logoUrl, description, emailDomains);
    }

    @Override
    public Optional<Institution> approveInstitution(final String id) {
        return institutionPort.findById(InstitutionId.of(id)).map(institution -> {
            final Institution approved = institutionPort.save(institution.approve());
            auditForInstitution(id, "INSTITUTION_APPROVED", "Institution", id, Map.of());
            return approved;
        });
    }

    @Override
    public Optional<Institution> activateInstitution(final String id) {
        return institutionPort.findById(InstitutionId.of(id)).map(institution -> {
            final Institution activated = institutionPort.save(institution.activate());
            auditForInstitution(id, "INSTITUTION_ACTIVATED", "Institution", id, Map.of());
            return activated;
        });
    }

    @Override
    public Optional<Institution> suspendInstitution(final String id) {
        return institutionPort.findById(InstitutionId.of(id)).map(institution -> {
            final Institution suspended = institutionPort.save(institution.suspend());
            auditForInstitution(id, "INSTITUTION_SUSPENDED", "Institution", id, Map.of());
            return suspended;
        });
    }

    @Override
    public Optional<Institution> revokeInstitution(final String id, final String reason) {
        return institutionPort.findById(InstitutionId.of(id)).map(institution -> {
            final Institution revoked = institutionPort.save(institution.revoke());
            auditForInstitution(id, "INSTITUTION_REVOKED", "Institution", id, Map.of("reason", reason));
            return revoked;
        });
    }

    @Override
    public Optional<Institution> verifyInstitution(final String id) {
        return institutionPort.findById(InstitutionId.of(id)).map(institution -> {
            final InstitutionId institutionId = institution.id();
            final Partnership existing = partnershipPort.findByInstitutionId(institutionId)
                    .orElseGet(() -> new Partnership(institutionId, PartnershipLevel.PROSPECT, false, Instant.now(), null, null));
            partnershipPort.save(new Partnership(
                    institutionId, existing.level(), true, existing.startedAt(), existing.endsAt(), existing.agreementDocumentUrl()));
            auditForInstitution(id, "INSTITUTION_VERIFIED", "Institution", id, Map.of());
            return institution;
        });
    }

    @Override
    public Optional<Partnership> updatePartnership(
            final String id, final PartnershipLevel level, final boolean verified, final Instant startedAt, final Instant endsAt,
            final String agreementDocumentUrl) {
        return institutionPort.findById(InstitutionId.of(id)).map(institution -> {
            final Partnership saved =
                    partnershipPort.save(new Partnership(institution.id(), level, verified, startedAt, endsAt, agreementDocumentUrl));
            auditForInstitution(id, "PARTNERSHIP_UPDATED", "Partnership", id, Map.of("level", level.name()));
            return saved;
        });
    }

    @Override
    public List<InstitutionAuditLog> listAllAuditLog() {
        return institutionAuditLogPort.findAll();
    }

    // --- helpers ---

    private Optional<InstitutionInvitation> findOwnInvitation(final String id) {
        final InstitutionId institutionId = currentInstitutionId();
        return institutionInvitationPort.findById(id).filter(invitation -> invitation.institutionId().equals(institutionId));
    }

    private Optional<EmploymentAffiliation> findOwnAffiliation(final String id) {
        final InstitutionId institutionId = currentInstitutionId();
        return employmentAffiliationPort.findById(id).filter(affiliation -> affiliation.institutionId().equals(institutionId));
    }

    private Optional<InstitutionPublication> findOwnPublication(final String id) {
        final InstitutionId institutionId = currentInstitutionId();
        return institutionPublicationPort.findById(id).filter(publication -> publication.institutionId().equals(institutionId));
    }

    private Optional<InstitutionOpportunity> findOwnOpportunity(final String id) {
        final InstitutionId institutionId = currentInstitutionId();
        return institutionOpportunityPort.findById(id).filter(opportunity -> opportunity.institutionId().equals(institutionId));
    }

    /** Institution-scoped audit entry (institution-side actions: resolves "my institution" from the caller's own claim). */
    private void audit(final String action, final String targetType, final String targetId, final Map<String, Object> metadata) {
        auditForInstitution(currentInstitutionId().toString(), action, targetType, targetId, metadata);
    }

    /**
     * Admin-side audit entry: {@code institutionId} is the TARGET institution (an admin
     * caller does not carry an {@code institutionId} claim of their own), {@code actorId} is
     * the caller's raw subject (an admin may not be a {@code Member} at all, so it is never
     * wrapped as a {@link MemberId}).
     */
    private void auditForInstitution(
            final String institutionId, final String action, final String targetType, final String targetId,
            final Map<String, Object> metadata) {
        institutionAuditLogPort.append(new InstitutionAuditLog(
                UUID.randomUUID().toString(), institutionId, currentIdentity().subject(), action, targetType, targetId, Instant.now(),
                metadata));
    }

    private InstitutionId currentInstitutionId() {
        final AuthenticatedIdentity identity = currentIdentity();
        if (identity.institutionId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "caller does not carry an institutionId claim");
        }
        return InstitutionId.of(identity.institutionId());
    }

    private MemberId currentMemberId() {
        return MemberId.of(currentIdentity().subject());
    }

    private AuthenticatedIdentity currentIdentity() {
        return securityContextPort.currentIdentity().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
