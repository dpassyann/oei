package global.oei.domain.core.certification;

import java.util.List;
import java.util.UUID;

import global.oei.domain.shared.certification.CertificationCatalogStatus;
import global.oei.domain.shared.certification.CertificationLevel;
import global.oei.domain.shared.certification.CertificationOeiStatus;
import global.oei.domain.shared.certification.CreateRecognizedCertificationUseCase;
import global.oei.domain.shared.certification.RecognizedCertification;
import global.oei.domain.shared.certification.RecognizedCertificationPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;

/**
 * Enforces the "always starts PUBLISHED" invariant on every admin-created catalog entry (see
 * {@link CreateRecognizedCertificationUseCase}'s own doc comment for why).
 */
@Slf4j
@RequiredArgsConstructor
public class CreateRecognizedCertificationService implements CreateRecognizedCertificationUseCase {

    @NonNull
    private final RecognizedCertificationPort recognizedCertificationPort;

    @Override
    public RecognizedCertification execute(
            final String name, final String issuingOrganization, final String catalogReference, final boolean autoValidate,
            final String domain, final CertificationLevel level, final String language, final CertificationOeiStatus oeiStatus,
            final List<String> competencies, final Integer validityMonths, final String associatedPathRoute, final String description) {
        log.debug("CreateRecognizedCertificationService: execute called");
        return recognizedCertificationPort.save(new RecognizedCertification(
                UUID.randomUUID().toString(), name, issuingOrganization, catalogReference, autoValidate, domain, level, language,
                oeiStatus == null ? CertificationOeiStatus.UNDER_REVIEW : oeiStatus, competencies, validityMonths, associatedPathRoute,
                description, CertificationCatalogStatus.PUBLISHED));
    }
}
