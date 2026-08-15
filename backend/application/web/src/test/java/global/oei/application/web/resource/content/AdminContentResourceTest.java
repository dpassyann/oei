package global.oei.application.web.resource.content;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.content.adapter.ContentAdapter;
import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentSourceType;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentWorkflowStatus;

/**
 * Standalone {@code MockMvc} test for {@link AdminContentResource} (CMS/Governance) — see
 * {@code MemberWalletResourceTest}'s Javadoc for why this style.
 */
class AdminContentResourceTest {

    private ContentAdapter contentAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        contentAdapter = mock(ContentAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new AdminContentResource(contentAdapter)).build();
    }

    @Test
    void createAdminContent_returnsCreatedDraftContent() throws Exception {
        final Content content = new Content(
                "content-1", ContentType.ARTICLE, "retour-experience-migration", ContentSourceType.CMS,
                "Retour d'expérience migration cloud", List.of("cloud"), null, null, ContentWorkflowStatus.DRAFT);
        when(contentAdapter.createContent(
                        ContentType.ARTICLE, "retour-experience-migration", ContentSourceType.CMS,
                        "Retour d'expérience migration cloud", List.of(), null))
                .thenReturn(content);

        mockMvc.perform(post("/api/admin/v1/content")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"type":"ARTICLE","slug":"retour-experience-migration","sourceType":"CMS",\
                                "title":"Retour d'expérience migration cloud"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("content-1"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void getAdminContent_returnsNotFoundWhenAbsent() throws Exception {
        when(contentAdapter.getContent(any())).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/admin/v1/content/unknown-id")).andExpect(status().isNotFound());
    }
}
