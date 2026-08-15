package global.oei.application.web.resource.contribution;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.contribution.adapter.ContributionAdapter;
import global.oei.domain.shared.content.ContentComment;
import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentContributionStatus;
import global.oei.domain.shared.member.MemberId;

/**
 * Standalone {@code MockMvc} test for {@link MemberContributionsResource}, following the same
 * pattern as {@code MemberWalletResourceTest}.
 */
class MemberContributionsResourceTest {

    private static final String MEMBER_ID = "f267e070-2fd5-5f83-a48b-9a733db64489";

    private ContributionAdapter contributionAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        contributionAdapter = mock(ContributionAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new MemberContributionsResource(contributionAdapter)).build();
    }

    @Test
    void listMyContributions_returnsTheMembersContributions() throws Exception {
        final MemberId memberId = new MemberId(UUID.fromString(MEMBER_ID));
        final ContentContribution contribution = new ContentContribution(
                "contribution-1", "content-1", "diff --git ...", memberId, ContentContributionStatus.PROPOSED, Instant.now());
        when(contributionAdapter.listMyContributions()).thenReturn(List.of(contribution));

        mockMvc.perform(get("/api/member/v1/contributions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("contribution-1"))
                .andExpect(jsonPath("$[0].status").value("PROPOSED"));
    }

    @Test
    void createContribution_returnsCreatedProposedContribution() throws Exception {
        final MemberId memberId = new MemberId(UUID.fromString(MEMBER_ID));
        final ContentContribution created = new ContentContribution(
                "contribution-2", "content-1", "diff --git ...", memberId, ContentContributionStatus.PROPOSED, Instant.now());
        when(contributionAdapter.create("content-1", "diff --git ...")).thenReturn(created);

        mockMvc.perform(post("/api/member/v1/contributions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"contentId":"content-1","patch":"diff --git ..."}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PROPOSED"));
    }

    @Test
    void listContributionComments_returnsNotFoundWhenContributionDoesNotExist() throws Exception {
        when(contributionAdapter.listComments("unknown-id")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/member/v1/contributions/unknown-id/comments"))
                .andExpect(status().isNotFound());
    }

    @Test
    void addContributionComment_returnsCreatedComment() throws Exception {
        final ContentComment comment = new ContentComment("comment-1", "contribution-1", null, MEMBER_ID, "Bon patch !", Instant.now());
        when(contributionAdapter.addComment(eq("contribution-1"), eq("Bon patch !"))).thenReturn(Optional.of(comment));

        mockMvc.perform(post("/api/member/v1/contributions/contribution-1/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"body":"Bon patch !"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.body").value("Bon patch !"));
    }
}
