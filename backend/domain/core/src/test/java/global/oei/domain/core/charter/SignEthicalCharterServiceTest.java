package global.oei.domain.core.charter;

import global.oei.domain.shared.charter.EthicalCharterSignature;
import global.oei.domain.shared.charter.EthicalCharterSignaturePort;
import global.oei.domain.shared.member.MemberId;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SignEthicalCharterServiceTest {

    private final EthicalCharterSignaturePort port = mock(EthicalCharterSignaturePort.class);
    private final SignEthicalCharterService service = new SignEthicalCharterService(port);

    @Test
    void execute_savesSignatureForCurrentMemberAndVersion() {
        final MemberId memberId = MemberId.newId();
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final EthicalCharterSignature signature = service.execute(memberId, "2026.1");

        assertThat(signature.memberId()).isEqualTo(memberId);
        assertThat(signature.version()).isEqualTo("2026.1");
    }
}
