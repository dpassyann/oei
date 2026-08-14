package global.oei.domain.core.institution;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.institution.CreateInstitutionOpportunityUseCase;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionOpportunity;
import global.oei.domain.shared.institution.InstitutionOpportunityPort;
import global.oei.domain.shared.institution.InstitutionOpportunityStatus;
import global.oei.domain.shared.institution.InstitutionOpportunityType;

/**
 * Default {@code CreateInstitutionOpportunityUseCase} implementation.
 */
public class CreateInstitutionOpportunityService implements CreateInstitutionOpportunityUseCase {

    private final InstitutionOpportunityPort institutionOpportunityPort;

    public CreateInstitutionOpportunityService(final InstitutionOpportunityPort institutionOpportunityPort) {
        this.institutionOpportunityPort = Objects.requireNonNull(institutionOpportunityPort, "institutionOpportunityPort must not be null");
    }

    @Override
    public InstitutionOpportunity execute(
            final InstitutionId institutionId, final InstitutionOpportunityType type, final String title, final String description,
            final Instant expiresAt) {
        final InstitutionOpportunity opportunity = new InstitutionOpportunity(
                UUID.randomUUID().toString(), institutionId, type, title, description, expiresAt,
                InstitutionOpportunityStatus.PUBLISHED, Instant.now());
        return institutionOpportunityPort.save(opportunity);
    }
}
