package global.oei.domain.shared.institution;

import java.util.Optional;

public interface PartnershipPort {

    Optional<Partnership> findByInstitutionId(InstitutionId institutionId);

    Partnership save(Partnership partnership);
}
