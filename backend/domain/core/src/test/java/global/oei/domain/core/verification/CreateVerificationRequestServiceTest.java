package global.oei.domain.core.verification;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.verification.VerificationRequest;
import global.oei.domain.shared.verification.VerificationRequestPort;
import global.oei.domain.shared.verification.VerificationRequestStatus;
import global.oei.domain.shared.verification.VerificationType;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CreateVerificationRequestServiceTest {

    private final VerificationRequestPort port = mock(VerificationRequestPort.class);
    private final CreateVerificationRequestService service = new CreateVerificationRequestService(port);

    @Test
    void execute_alwaysStartsPendingWithNoReviewer() {
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final VerificationRequest request = service.execute(MemberId.newId(), VerificationType.CERTIFICATION, "cert-123");

        assertThat(request.status()).isEqualTo(VerificationRequestStatus.PENDING);
        assertThat(request.reviewedAt()).isNull();
        assertThat(request.reviewerId()).isNull();
        assertThat(request.referenceId()).isEqualTo("cert-123");
        assertThat(request.id()).isNotBlank();
    }
}
