package global.oei.domain.core.wallet;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.wallet.WalletPass;
import global.oei.domain.shared.wallet.WalletPassPort;
import global.oei.domain.shared.wallet.WalletPassProvider;
import global.oei.domain.shared.wallet.WalletPassStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CreateWalletPassServiceTest {

    private final WalletPassPort port = mock(WalletPassPort.class);
    private final CreateWalletPassService service = new CreateWalletPassService(port);

    @Test
    void execute_alwaysCreatesAMockedPass() {
        when(port.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        final WalletPass pass = service.execute(MemberId.newId(), WalletPassProvider.APPLE);

        assertThat(pass.mocked()).isTrue();
        assertThat(pass.status()).isEqualTo(WalletPassStatus.MOCKED);
        assertThat(pass.serialNumber()).isNotBlank();
    }
}
