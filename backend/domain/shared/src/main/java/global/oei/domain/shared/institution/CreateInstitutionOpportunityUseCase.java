package global.oei.domain.shared.institution;

import java.time.Instant;

/**
 * Inbound port: create and immediately publish an {@link InstitutionOpportunity}.
 */
public interface CreateInstitutionOpportunityUseCase {

    InstitutionOpportunity execute(
            InstitutionId institutionId, InstitutionOpportunityType type, String title, String description, Instant expiresAt);
}
