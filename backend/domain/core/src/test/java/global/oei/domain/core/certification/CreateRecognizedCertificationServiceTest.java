package global.oei.domain.core.certification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.certification.CertificationCatalogStatus;
import global.oei.domain.shared.certification.CertificationLevel;
import global.oei.domain.shared.certification.CertificationOeiStatus;
import global.oei.domain.shared.certification.RecognizedCertification;
import global.oei.domain.shared.certification.RecognizedCertificationPort;

class CreateRecognizedCertificationServiceTest {

    private final RecognizedCertificationPort port = mock(RecognizedCertificationPort.class);
    private final CreateRecognizedCertificationService service = new CreateRecognizedCertificationService(port);

    @Test
    void execute_alwaysStartsPublished() {
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final RecognizedCertification created = service.execute(
                "CKA", "Linux Foundation", null, false, "Cloud & infrastructure", CertificationLevel.ENGINEER, "en",
                CertificationOeiStatus.OEI_RECOGNIZED, List.of("Kubernetes"), 36, null, "Administration Kubernetes.");

        assertThat(created.catalogStatus()).isEqualTo(CertificationCatalogStatus.PUBLISHED);
        assertThat(created.id()).isNotBlank();
        assertThat(created.name()).isEqualTo("CKA");
    }

    @Test
    void execute_defaultsNullOeiStatusToUnderReview() {
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final RecognizedCertification created = service.execute(
                "New Certification", "Some Org", null, false, "Domain", CertificationLevel.PRACTITIONER, "en", null, List.of(), null,
                null, null);

        assertThat(created.oeiStatus()).isEqualTo(CertificationOeiStatus.UNDER_REVIEW);
    }
}
