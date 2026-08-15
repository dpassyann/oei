package global.oei.application.web.resource.publicprofile;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.publicprofile.adapter.PublicProfileAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.MembershipTier;
import global.oei.domain.shared.publicprofile.DigitalBusinessCard;
import global.oei.domain.shared.publicprofile.PublicProfile;

/**
 * Standalone {@code MockMvc} test for {@link MemberPublicProfileResource}, following the same
 * pattern as {@code MemberWalletResourceTest}.
 */
class MemberPublicProfileResourceTest {

    private static final String MEMBER_ID = "f267e070-2fd5-5f83-a48b-9a733db64489";

    private PublicProfileAdapter publicProfileAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        publicProfileAdapter = mock(PublicProfileAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new MemberPublicProfileResource(publicProfileAdapter)).build();
    }

    @Test
    void getMyPublicProfileSettings_returnsUnpublishedDefaultWhenNeverPublished() throws Exception {
        final MemberId memberId = new MemberId(UUID.fromString(MEMBER_ID));
        when(publicProfileAdapter.getMySettings())
                .thenReturn(new PublicProfile(memberId, "demo-alice-nguyen-0", List.of(), null, null, 0));

        mockMvc.perform(get("/api/member/v1/public-profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publicSlug").value("demo-alice-nguyen-0"))
                .andExpect(jsonPath("$.visibleFields").isEmpty());
    }

    @Test
    void publishPublicProfile_returnsThePublishedProfile() throws Exception {
        final MemberId memberId = new MemberId(UUID.fromString(MEMBER_ID));
        when(publicProfileAdapter.publish(anyString(), anyList(), any()))
                .thenReturn(new PublicProfile(
                        memberId, "custom-slug", List.of("displayName", "certifications"), "SEO text", Instant.now(), 0));

        mockMvc.perform(post("/api/member/v1/public-profile/publish")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"publicSlug":"custom-slug","visibleFields":["displayName","certifications"],"seoDescription":"SEO text"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publicSlug").value("custom-slug"))
                .andExpect(jsonPath("$.visibleFields[0]").value("displayName"));
    }

    @Test
    void generateDigitalCard_returnsAMockedCard() throws Exception {
        final MemberId memberId = new MemberId(UUID.fromString(MEMBER_ID));
        when(publicProfileAdapter.generateDigitalCard()).thenReturn(new DigitalBusinessCard(
                memberId, "demo-alice-nguyen-0", "https://oei.example.org/card/demo-alice-nguyen-0/qr.png",
                "https://oei.example.org/card/demo-alice-nguyen-0.vcf", "default", MembershipTier.GOLD));

        mockMvc.perform(post("/api/member/v1/digital-card"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publicSlug").value("demo-alice-nguyen-0"))
                .andExpect(jsonPath("$.tier").value("GOLD"));
    }
}
