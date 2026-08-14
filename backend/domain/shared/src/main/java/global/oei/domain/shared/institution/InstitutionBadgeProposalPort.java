package global.oei.domain.shared.institution;

import java.util.List;

public interface InstitutionBadgeProposalPort {

    List<InstitutionBadgeProposal> findByInstitutionId(InstitutionId institutionId);

    InstitutionBadgeProposal save(InstitutionBadgeProposal proposal);
}
