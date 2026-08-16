package global.oei.domain.shared.certification;

import java.util.List;

/**
 * Inbound port: create a new catalog entry, always starting
 * {@link CertificationCatalogStatus#PUBLISHED} — this scope has no draft/review workflow
 * ("ajouter" from the admin console makes the entry immediately visible on {@code
 * /certifications}); {@code archive} ("dépublier") is the only other status transition.
 */
public interface CreateRecognizedCertificationUseCase {

    RecognizedCertification execute(
            String name, String issuingOrganization, String catalogReference, boolean autoValidate, String domain,
            CertificationLevel level, String language, CertificationOeiStatus oeiStatus, List<String> competencies,
            Integer validityMonths, String associatedPathRoute, String description);
}
