package global.oei.application.web.resource.institution.mapper;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import global.oei.application.web.model.EmploymentAffiliationDTO;
import global.oei.application.web.model.InstitutionAuditLogDTO;
import global.oei.application.web.model.InstitutionBadgeProposalDTO;
import global.oei.application.web.model.InstitutionDTO;
import global.oei.application.web.model.InstitutionDashboardDTO;
import global.oei.application.web.model.InstitutionDomainDTO;
import global.oei.application.web.model.InstitutionInvitationDTO;
import global.oei.application.web.model.InstitutionMembershipDTO;
import global.oei.application.web.model.InstitutionOpportunityDTO;
import global.oei.application.web.model.InstitutionPublicPageDTO;
import global.oei.application.web.model.InstitutionPublicationDTO;
import global.oei.application.web.model.InstitutionRoleDTO;
import global.oei.application.web.model.InstitutionWorkflowStatusDTO;
import global.oei.application.web.model.MemberInstitutionAffiliationDTO;
import global.oei.application.web.model.PartnershipDTO;
import global.oei.application.web.model.PartnershipLevelDTO;
import global.oei.domain.shared.institution.EmploymentAffiliation;
import global.oei.domain.shared.institution.EmploymentAffiliationStatus;
import global.oei.domain.shared.institution.Institution;
import global.oei.domain.shared.institution.InstitutionAuditLog;
import global.oei.domain.shared.institution.InstitutionBadgeProposal;
import global.oei.domain.shared.institution.InstitutionDashboard;
import global.oei.domain.shared.institution.InstitutionDomain;
import global.oei.domain.shared.institution.InstitutionInvitation;
import global.oei.domain.shared.institution.InstitutionMembership;
import global.oei.domain.shared.institution.InstitutionOpportunity;
import global.oei.domain.shared.institution.InstitutionPublication;
import global.oei.domain.shared.institution.Partnership;
import lombok.experimental.UtilityClass;
import org.openapitools.jackson.nullable.JsonNullable;

@UtilityClass
public class InstitutionDtoMapper {

    public InstitutionDTO toDto(final Institution institution) {
        final InstitutionDTO dto = new InstitutionDTO(
                institution.id().toString(), institution.legalName(), institution.publicName(), institution.country(),
                institution.publicSlug());
        dto.setLogoUrl(institution.logoUrl() == null ? null : URI.create(institution.logoUrl()));
        dto.setSectors(institution.sectors());
        dto.setDescription(institution.description());
        dto.setEmailDomains(institution.emailDomains().stream().map(InstitutionDtoMapper::toDto).toList());
        dto.setIsDemoData(institution.isDemoData());
        dto.setStatus(InstitutionWorkflowStatusDTO.valueOf(institution.status().name()));
        return dto;
    }

    public InstitutionDomainDTO toDto(final InstitutionDomain domain) {
        final InstitutionDomainDTO dto = new InstitutionDomainDTO(domain.id(), domain.domain(), domain.verified());
        dto.setVerifiedAt(JsonNullable.of(
                domain.verifiedAt() == null ? null : LocalDateTime.ofInstant(domain.verifiedAt(), ZoneOffset.UTC)));
        return dto;
    }

    public PartnershipDTO toDto(final Partnership partnership) {
        final PartnershipDTO dto = new PartnershipDTO(
                partnership.institutionId().toString(), PartnershipLevelDTO.valueOf(partnership.level().name()), partnership.verified());
        dto.setStartedAt(partnership.startedAt() == null ? null : LocalDateTime.ofInstant(partnership.startedAt(), ZoneOffset.UTC));
        dto.setEndsAt(JsonNullable.of(
                partnership.endsAt() == null ? null : LocalDateTime.ofInstant(partnership.endsAt(), ZoneOffset.UTC)));
        dto.setAgreementDocumentUrl(partnership.agreementDocumentUrl() == null ? null : URI.create(partnership.agreementDocumentUrl()));
        return dto;
    }

    public InstitutionMembershipDTO toDto(final InstitutionMembership membership) {
        final InstitutionMembershipDTO dto = new InstitutionMembershipDTO(
                membership.memberId().toString(), membership.institutionId().toString(), InstitutionRoleDTO.valueOf(membership.role().name()));
        dto.setGrantedAt(membership.grantedAt() == null ? null : LocalDateTime.ofInstant(membership.grantedAt(), ZoneOffset.UTC));
        dto.setGrantedBy(membership.grantedBy());
        return dto;
    }

    public InstitutionInvitationDTO toDto(final InstitutionInvitation invitation) {
        final InstitutionInvitationDTO dto = new InstitutionInvitationDTO(
                invitation.email(), InstitutionRoleDTO.valueOf(invitation.role().name()), invitation.id(),
                invitation.institutionId().toString(), InstitutionInvitationDTO.StatusEnum.valueOf(invitation.status().name()),
                LocalDateTime.ofInstant(invitation.invitedAt(), ZoneOffset.UTC));
        dto.setInvitedBy(invitation.invitedBy());
        dto.setExpiresAt(invitation.expiresAt() == null ? null : LocalDateTime.ofInstant(invitation.expiresAt(), ZoneOffset.UTC));
        return dto;
    }

    /** Member-facing lexicon: {@code ACCEPTED} maps to {@code VERIFIED} (see {@code EmploymentAffiliationStatus}'s Javadoc). */
    public EmploymentAffiliationDTO toMemberDto(final EmploymentAffiliation affiliation) {
        final EmploymentAffiliationDTO dto = new EmploymentAffiliationDTO(
                affiliation.id(), affiliation.memberId().toString(), affiliation.institutionId().toString(),
                EmploymentAffiliationDTO.VerificationMethodEnum.valueOf(affiliation.verificationMethod().name()),
                toMemberStatus(affiliation.status()));
        dto.setStartedAt(affiliation.startedAt() == null ? null : LocalDateTime.ofInstant(affiliation.startedAt(), ZoneOffset.UTC));
        dto.setEndedAt(JsonNullable.of(
                affiliation.endedAt() == null ? null : LocalDateTime.ofInstant(affiliation.endedAt(), ZoneOffset.UTC)));
        return dto;
    }

    /** Institution-facing lexicon: {@code ACCEPTED} maps to {@code APPROVED} (see {@code EmploymentAffiliationStatus}'s Javadoc). */
    public MemberInstitutionAffiliationDTO toInstitutionDto(final EmploymentAffiliation affiliation) {
        final MemberInstitutionAffiliationDTO dto = new MemberInstitutionAffiliationDTO(
                affiliation.id(), affiliation.memberId().toString(), affiliation.institutionId().toString(),
                toInstitutionStatus(affiliation.status()));
        dto.setRequestedAt(affiliation.requestedAt() == null ? null : LocalDateTime.ofInstant(affiliation.requestedAt(), ZoneOffset.UTC));
        dto.setDecidedAt(JsonNullable.of(
                affiliation.decidedAt() == null ? null : LocalDateTime.ofInstant(affiliation.decidedAt(), ZoneOffset.UTC)));
        dto.setDecidedBy(JsonNullable.of(affiliation.decidedBy()));
        return dto;
    }

    private EmploymentAffiliationDTO.StatusEnum toMemberStatus(final EmploymentAffiliationStatus status) {
        return switch (status) {
            case PENDING -> EmploymentAffiliationDTO.StatusEnum.PENDING;
            case ACCEPTED -> EmploymentAffiliationDTO.StatusEnum.VERIFIED;
            case REJECTED -> EmploymentAffiliationDTO.StatusEnum.REJECTED;
            case ENDED -> EmploymentAffiliationDTO.StatusEnum.ENDED;
        };
    }

    private MemberInstitutionAffiliationDTO.StatusEnum toInstitutionStatus(final EmploymentAffiliationStatus status) {
        return switch (status) {
            case PENDING -> MemberInstitutionAffiliationDTO.StatusEnum.PENDING;
            case ACCEPTED -> MemberInstitutionAffiliationDTO.StatusEnum.APPROVED;
            case REJECTED -> MemberInstitutionAffiliationDTO.StatusEnum.REJECTED;
            case ENDED -> MemberInstitutionAffiliationDTO.StatusEnum.ENDED;
        };
    }

    public InstitutionDashboardDTO toDto(final InstitutionDashboard dashboard) {
        final InstitutionDashboardDTO dto = new InstitutionDashboardDTO(dashboard.institutionId().toString());
        dto.setAffiliatedMembers(dashboard.affiliatedMembers());
        dto.setActiveMembers(dashboard.activeMembers());
        dto.setVerifiedProfiles(dashboard.verifiedProfiles());
        dto.setCertifications(dashboard.certifications());
        dto.setBadges(dashboard.badges());
        dto.setSignedCharters(dashboard.signedCharters());
        dto.setContributions(dashboard.contributions());
        dto.setTrainings(dashboard.trainings());
        dto.setOpportunities(dashboard.opportunities());
        dto.setPublications(dashboard.publications());
        dto.setInvitations(dashboard.invitations());
        return dto;
    }

    public InstitutionPublicationDTO toDto(final InstitutionPublication publication) {
        final InstitutionPublicationDTO dto = new InstitutionPublicationDTO(
                global.oei.application.web.model.InstitutionPublicationTypeDTO.valueOf(publication.type().name()), publication.title(),
                publication.body(), publication.id(), publication.institutionId().toString(),
                global.oei.application.web.model.PublicationWorkflowStatusDTO.valueOf(publication.status().name()));
        dto.setAuthorMemberId(publication.authorMemberId() == null ? null : publication.authorMemberId().toString());
        dto.setSubmittedAt(JsonNullable.of(
                publication.submittedAt() == null ? null : LocalDateTime.ofInstant(publication.submittedAt(), ZoneOffset.UTC)));
        dto.setPublishedAt(JsonNullable.of(
                publication.publishedAt() == null ? null : LocalDateTime.ofInstant(publication.publishedAt(), ZoneOffset.UTC)));
        return dto;
    }

    public InstitutionOpportunityDTO toDto(final InstitutionOpportunity opportunity) {
        final InstitutionOpportunityDTO dto = new InstitutionOpportunityDTO(
                global.oei.application.web.model.InstitutionOpportunityTypeDTO.valueOf(opportunity.type().name()), opportunity.title(),
                opportunity.description(), opportunity.id(), opportunity.institutionId().toString(),
                InstitutionOpportunityDTO.StatusEnum.valueOf(opportunity.status().name()));
        dto.setExpiresAt(opportunity.expiresAt() == null ? null : LocalDateTime.ofInstant(opportunity.expiresAt(), ZoneOffset.UTC));
        dto.setPublishedAt(JsonNullable.of(
                opportunity.publishedAt() == null ? null : LocalDateTime.ofInstant(opportunity.publishedAt(), ZoneOffset.UTC)));
        return dto;
    }

    public InstitutionBadgeProposalDTO toDto(final InstitutionBadgeProposal proposal) {
        return new InstitutionBadgeProposalDTO(
                proposal.memberId().toString(), proposal.proposedBadgeCode(), proposal.justification(), proposal.id(),
                proposal.institutionId().toString(), InstitutionBadgeProposalDTO.StatusEnum.valueOf(proposal.status().name()));
    }

    public InstitutionAuditLogDTO toDto(final InstitutionAuditLog entry) {
        final InstitutionAuditLogDTO dto = new InstitutionAuditLogDTO(
                entry.id(), entry.actorId(), entry.action(), LocalDateTime.ofInstant(entry.occurredAt(), ZoneOffset.UTC));
        dto.setTargetType(entry.targetType());
        dto.setTargetId(entry.targetId());
        dto.setMetadata(entry.metadata());
        return dto;
    }

    public InstitutionPublicPageDTO toPublicPageDto(
            final Institution institution, final Partnership partnership, final List<InstitutionPublication> publications,
            final List<InstitutionOpportunity> opportunities) {
        final InstitutionPublicPageDTO dto = new InstitutionPublicPageDTO(toDto(institution));
        dto.setPartnership(partnership == null ? null : toDto(partnership));
        dto.setPublications(publications.stream().map(InstitutionDtoMapper::toDto).toList());
        dto.setOpportunities(opportunities.stream().map(InstitutionDtoMapper::toDto).toList());
        return dto;
    }
}
