package global.oei.domain.shared.institution;

import java.util.List;

/**
 * Outbound port for {@link InstitutionBadgeProposal}.
 */
public interface InstitutionBadgeProposalPort {

    List<InstitutionBadgeProposal> findByInstitutionId(InstitutionId institutionId);

    InstitutionBadgeProposal save(InstitutionBadgeProposal proposal);
}
