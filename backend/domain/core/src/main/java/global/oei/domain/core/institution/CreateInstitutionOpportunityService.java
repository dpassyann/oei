package global.oei.domain.core.institution;

import java.time.Instant;
import java.util.UUID;

import org.jspecify.annotations.NonNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.institution.CreateInstitutionOpportunityUseCase;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionOpportunity;
import global.oei.domain.shared.institution.InstitutionOpportunityPort;
import global.oei.domain.shared.institution.InstitutionOpportunityStatus;
import global.oei.domain.shared.institution.InstitutionOpportunityType;

/**
 * Default {@code CreateInstitutionOpportunityUseCase} implementation.
 */
@Slf4j
@RequiredArgsConstructor
public class CreateInstitutionOpportunityService implements CreateInstitutionOpportunityUseCase {

    @NonNull
    private final InstitutionOpportunityPort institutionOpportunityPort;

    @Override
    public InstitutionOpportunity execute(
            final InstitutionId institutionId, final InstitutionOpportunityType type, final String title, final String description,
            final Instant expiresAt) {
        log.debug("CreateInstitutionOpportunityService: execute called");
        final InstitutionOpportunity opportunity = new InstitutionOpportunity(
                UUID.randomUUID().toString(), institutionId, type, title, description, expiresAt,
                InstitutionOpportunityStatus.PUBLISHED, Instant.now());
        return institutionOpportunityPort.save(opportunity);
    }
}
