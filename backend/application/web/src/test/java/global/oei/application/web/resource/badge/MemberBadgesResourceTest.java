package global.oei.application.web.resource.badge;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.badge.adapter.BadgeAdapter;
import global.oei.domain.shared.badge.BadgeAward;
import global.oei.domain.shared.badge.BadgeAwardSource;
import global.oei.domain.shared.member.MemberId;

/**
 * Standalone {@code MockMvc} test for {@link MemberBadgesResource} — see
 * {@code MemberWalletResourceTest}'s Javadoc for why this style.
 */
class MemberBadgesResourceTest {

    private BadgeAdapter badgeAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        badgeAdapter = mock(BadgeAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new MemberBadgesResource(badgeAdapter)).build();
    }

    @Test
    void listMyBadges_returnsAwardedBadges() throws Exception {
        final BadgeAward award = new BadgeAward(
                "award-1", "badge-mentor", new MemberId(UUID.fromString("f267e070-2fd5-5f83-a48b-9a733db64489")), Instant.now(),
                BadgeAwardSource.MANUAL, "admin-1", false);
        when(badgeAdapter.listMyBadges()).thenReturn(List.of(award));

        mockMvc.perform(get("/api/member/v1/badges"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("award-1"))
                .andExpect(jsonPath("$[0].badgeId").value("badge-mentor"))
                .andExpect(jsonPath("$[0].revoked").value(false));
    }
}
