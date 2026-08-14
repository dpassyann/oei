package global.oei.domain.shared.institution;

import java.util.List;

/**
 * Inbound port: create a new admin-managed institution, always starting
 * {@link InstitutionWorkflowStatus#DRAFT} with an unverified email domain per submitted
 * domain string.
 */
public interface CreateInstitutionUseCase {

    Institution execute(
            String legalName, String publicName, String country, String logoUrl, String description, List<String> emailDomains);
}
