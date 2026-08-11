package global.oei.domain.core.identity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.GetMyIdentityUseCase;
import global.oei.domain.shared.security.SecurityContextPort;

class GetMyIdentityServiceTest {

    @Test
    void execute_returnsIdentityFromPort() {
        final SecurityContextPort port = mock(SecurityContextPort.class);
        final AuthenticatedIdentity identity =
                new AuthenticatedIdentity("sub-1", "jane@oei.org", "Jane Doe", Set.of("member"));
        when(port.currentIdentity()).thenReturn(Optional.of(identity));

        final GetMyIdentityUseCase useCase = new GetMyIdentityService(port);

        assertThat(useCase.execute()).contains(identity);
    }

    @Test
    void execute_returnsEmptyWhenNoAuthenticatedCaller() {
        final SecurityContextPort port = mock(SecurityContextPort.class);
        when(port.currentIdentity()).thenReturn(Optional.empty());

        final GetMyIdentityUseCase useCase = new GetMyIdentityService(port);

        assertThat(useCase.execute()).isEmpty();
    }

    @Test
    void constructor_rejectsNullPort() {
        assertThatThrownBy(() -> new GetMyIdentityService(null)).isInstanceOf(NullPointerException.class);
    }
}
