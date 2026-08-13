package global.oei.domain.core.certification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationPort;
import global.oei.domain.shared.certification.CertificationStatus;
import global.oei.domain.shared.member.MemberId;

class DeclareCertificationServiceTest {

    private final CertificationPort port = mock(CertificationPort.class);
    private final DeclareCertificationService service = new DeclareCertificationService(port);

    @Test
    void execute_alwaysStartsAtDeclaredStatus() {
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final Certification certification =
                service.execute(MemberId.newId(), "CISSP", "ISC2", null, null, null, null);

        assertThat(certification.status()).isEqualTo(CertificationStatus.DECLARED);
        assertThat(certification.validatedBy()).isNull();
        assertThat(certification.validatedAt()).isNull();
    }
}
