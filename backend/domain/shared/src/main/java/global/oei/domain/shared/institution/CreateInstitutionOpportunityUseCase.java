package global.oei.domain.shared.institution;

import java.time.Instant;

public interface CreateInstitutionOpportunityUseCase {

    InstitutionOpportunity execute(
            InstitutionId institutionId, InstitutionOpportunityType type, String title, String description, Instant expiresAt);
}
