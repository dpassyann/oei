package global.oei.application.web.resource.wallet;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.wallet.adapter.WalletAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.wallet.WalletPass;
import global.oei.domain.shared.wallet.WalletPassProvider;
import global.oei.domain.shared.wallet.WalletPassStatus;

/**
 * Standalone {@code MockMvc} test for {@link MemberWalletResource}: the resource is
 * constructed directly with a mocked {@link WalletAdapter} (never the real
 * {@code service.WalletService}) — no Spring context is booted at all, avoiding every
 * cross-module wiring/security-autoconfiguration concern a full {@code @WebMvcTest} slice
 * would otherwise pull in (see {@code infrastructure-wiring}'s
 * {@code OeiWiringConfigurationTest} for that level of test instead). Real HTTP dispatch and
 * real JSON (de)serialization through Spring MVC's own machinery, just no security filter
 * chain — this style exercises the happy path and business-level error responses (contract
 * shape, status codes), which is this test's purpose; authentication/authorization itself is
 * {@code infrastructure-security}'s own concern, covered by
 * {@code OeiJwtAuthenticationConverterTest}.
 */
class MemberWalletResourceTest {

    private static final String MEMBER_ID = "f267e070-2fd5-5f83-a48b-9a733db64489";

    private WalletAdapter walletAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        walletAdapter = mock(WalletAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new MemberWalletResource(walletAdapter)).build();
    }

    @Test
    void createAppleWalletPass_returnsCreatedMockedPass() throws Exception {
        final WalletPass pass = new WalletPass(
                "pass-1", new MemberId(UUID.fromString(MEMBER_ID)), WalletPassProvider.APPLE, WalletPassStatus.MOCKED,
                "MOCK-serial-1", null, null, Instant.now(), null, true);
        when(walletAdapter.createPass(WalletPassProvider.APPLE)).thenReturn(pass);

        mockMvc.perform(post("/api/member/v1/wallet/apple-pass"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("pass-1"))
                .andExpect(jsonPath("$.provider").value("APPLE"))
                .andExpect(jsonPath("$.mocked").value(true));
    }

    @Test
    void revokeMyWalletPass_returnsNotFoundWhenPassDoesNotBelongToCaller() throws Exception {
        when(walletAdapter.revokePass(any())).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/member/v1/wallet/passes/unknown-id/revoke"))
                .andExpect(status().isNotFound());
    }
}
