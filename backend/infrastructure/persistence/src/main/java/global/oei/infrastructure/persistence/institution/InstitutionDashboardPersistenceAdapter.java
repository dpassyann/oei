package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.institution.EmploymentAffiliationStatus;
import global.oei.domain.shared.institution.InstitutionDashboard;
import global.oei.domain.shared.institution.InstitutionDashboardPort;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.infrastructure.persistence.badge.BadgeAwardRepository;
import global.oei.infrastructure.persistence.certification.CertificationRepository;
import global.oei.infrastructure.persistence.charter.EthicalCharterSignatureRepository;
import global.oei.infrastructure.persistence.profile.ProfessionalProfileRepository;

/**
 * Computes real, DB-backed KPIs by joining the institution's accepted
 * {@link EmploymentAffiliationEntity} rows against other bounded contexts' own tables.
 * {@link InstitutionDashboard#contributions()} and {@link InstitutionDashboard#trainings()}
 * are always {@code 0} — see that record's Javadoc for why.
 */
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstitutionDashboardPersistenceAdapter implements InstitutionDashboardPort {

    private final EmploymentAffiliationRepository employmentAffiliationRepository;
    private final CertificationRepository certificationRepository;
    private final BadgeAwardRepository badgeAwardRepository;
    private final EthicalCharterSignatureRepository ethicalCharterSignatureRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final InstitutionPublicationRepository institutionPublicationRepository;
    private final InstitutionOpportunityRepository institutionOpportunityRepository;
    private final InstitutionInvitationRepository institutionInvitationRepository;

    @Override
    public InstitutionDashboard compute(final InstitutionId institutionId) {
        final UUID id = institutionId.value();
        final long affiliatedMembers = employmentAffiliationRepository.findByInstitutionId(id).size();
        final List<UUID> activeMemberIds = employmentAffiliationRepository
                .findByInstitutionIdAndStatus(id, EmploymentAffiliationStatus.ACCEPTED.name())
                .stream()
                .map(EmploymentAffiliationEntity::getMemberId)
                .toList();

        return new InstitutionDashboard(
                institutionId,
                (int) affiliatedMembers,
                activeMemberIds.size(),
                activeMemberIds.isEmpty() ? 0 : (int) professionalProfileRepository.countByMemberIdIn(activeMemberIds),
                activeMemberIds.isEmpty() ? 0 : (int) certificationRepository.countByMemberIdIn(activeMemberIds),
                activeMemberIds.isEmpty() ? 0 : (int) badgeAwardRepository.countByMemberIdIn(activeMemberIds),
                activeMemberIds.isEmpty() ? 0 : (int) ethicalCharterSignatureRepository.countByMemberIdIn(activeMemberIds),
                0,
                0,
                (int) institutionOpportunityRepository.countByInstitutionId(id),
                (int) institutionPublicationRepository.countByInstitutionId(id),
                (int) institutionInvitationRepository.countByInstitutionId(id));
    }
}
