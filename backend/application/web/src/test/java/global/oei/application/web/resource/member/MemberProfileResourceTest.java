package global.oei.application.web.resource.member;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.member.adapter.CharterAdapter;
import global.oei.application.web.resource.member.adapter.MembershipAdapter;
import global.oei.application.web.resource.member.adapter.ProfileAdapter;
import global.oei.domain.shared.charter.EthicalCharterSignature;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.Membership;
import global.oei.domain.shared.membership.MembershipStatus;
import global.oei.domain.shared.membership.MembershipTier;

/**
 * Standalone {@code MockMvc} test for {@link MemberProfileResource} — covers the
 * Membership/Charter share of this combined resource (Profile itself is exercised at the
 * mapper level elsewhere); see {@code MemberWalletResourceTest}'s Javadoc for why this style.
 */
class MemberProfileResourceTest {

    private static final String MEMBER_ID = "f267e070-2fd5-5f83-a48b-9a733db64489";

    private MembershipAdapter membershipAdapter;
    private ProfileAdapter profileAdapter;
    private CharterAdapter charterAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        membershipAdapter = mock(MembershipAdapter.class);
        profileAdapter = mock(ProfileAdapter.class);
        charterAdapter = mock(CharterAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new MemberProfileResource(membershipAdapter, profileAdapter, charterAdapter)).build();
    }

    @Test
    void getMyMembership_returnsMembershipTierAndStatus() throws Exception {
        final Membership membership = new Membership(
                new MemberId(UUID.fromString(MEMBER_ID)), MembershipTier.GOLD, MembershipStatus.ACTIVE, Instant.now(), null, null);
        when(membershipAdapter.getMyMembership()).thenReturn(membership);

        mockMvc.perform(get("/api/member/v1/membership"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tier").value("GOLD"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void signEthicalCharter_returnsCreatedSignature() throws Exception {
        final EthicalCharterSignature signature =
                new EthicalCharterSignature(UUID.randomUUID(), new MemberId(UUID.fromString(MEMBER_ID)), "2026.1", Instant.now());
        when(charterAdapter.signEthicalCharter("2026.1")).thenReturn(signature);

        mockMvc.perform(post("/api/member/v1/ethical-charter/sign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"version":"2026.1"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.version").value("2026.1"));
    }
}
