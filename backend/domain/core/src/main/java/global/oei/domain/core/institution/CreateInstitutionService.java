package global.oei.domain.core.institution;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.institution.CreateInstitutionUseCase;
import global.oei.domain.shared.institution.Institution;
import global.oei.domain.shared.institution.InstitutionDomain;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionPort;
import global.oei.domain.shared.institution.InstitutionWorkflowStatus;

/**
 * Enforces the "always starts DRAFT" invariant on every admin-created institution, and
 * derives a URL-safe {@link Institution#publicSlug()} from {@code publicName} (a random
 * suffix keeps it unique without a pre-check round trip).
 */
public class CreateInstitutionService implements CreateInstitutionUseCase {

    private final InstitutionPort institutionPort;

    public CreateInstitutionService(final InstitutionPort institutionPort) {
        this.institutionPort = Objects.requireNonNull(institutionPort, "institutionPort must not be null");
    }

    @Override
    public Institution execute(
            final String legalName, final String publicName, final String country, final String logoUrl, final String description,
            final List<String> emailDomains) {
        final InstitutionId id = InstitutionId.newId();
        final String slug = slugify(publicName) + "-" + id.value().toString().substring(0, 8);
        final Institution institution = institutionPort.save(new Institution(
                id, legalName, publicName, logoUrl, country, List.of(), description, List.of(), slug, false,
                InstitutionWorkflowStatus.DRAFT));
        for (final String domain : emailDomains == null ? List.<String>of() : emailDomains) {
            institutionPort.addDomain(id, new InstitutionDomain(UUID.randomUUID().toString(), domain, false, null));
        }
        return institution;
    }

    private static String slugify(final String value) {
        return value.toLowerCase(Locale.ROOT).trim().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }
}
