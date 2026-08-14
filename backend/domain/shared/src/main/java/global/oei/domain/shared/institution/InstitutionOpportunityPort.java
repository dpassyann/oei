package global.oei.domain.shared.institution;

import java.util.List;
import java.util.Optional;

public interface InstitutionOpportunityPort {

    List<InstitutionOpportunity> findByInstitutionId(InstitutionId institutionId);

    List<InstitutionOpportunity> findPublishedByInstitutionId(InstitutionId institutionId);

    Optional<InstitutionOpportunity> findById(String id);

    InstitutionOpportunity save(InstitutionOpportunity opportunity);
}
