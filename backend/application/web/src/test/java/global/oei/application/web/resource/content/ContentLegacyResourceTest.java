package global.oei.application.web.resource.content;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentSourceType;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentVersion;
import global.oei.domain.shared.content.ContentVersionPort;
import global.oei.domain.shared.content.ContentWorkflowStatus;

class ContentLegacyResourceTest {

    private ContentPort contentPort;
    private ContentVersionPort contentVersionPort;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        contentPort = mock(ContentPort.class);
        contentVersionPort = mock(ContentVersionPort.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new ContentLegacyResource(contentPort, contentVersionPort)).build();
    }

    @Test
    void getContent_returnsPublishedVersionInRequestedLanguage() throws Exception {
        final Content content = new Content(
                "content-1", ContentType.PAGE, "notre-mission", ContentSourceType.CMS, "Notre mission", List.of(), null, "version-1",
                ContentWorkflowStatus.PUBLISHED);
        when(contentPort.findAll()).thenReturn(List.of(content));
        final ContentVersion version = new ContentVersion(
                "version-1", "content-1", "1", "fr", "Notre mission", "Corps du texte", null, null, ContentWorkflowStatus.PUBLISHED,
                Instant.now());
        when(contentVersionPort.findByContentId("content-1")).thenReturn(List.of(version));

        mockMvc.perform(get("/content/fr/notre-mission"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Notre mission"))
                .andExpect(jsonPath("$.isFallback").value(false));
    }

    @Test
    void getContent_unknownSlug_returnsFallbackDocument() throws Exception {
        when(contentPort.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/content/fr/inconnu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFallback").value(true));
    }
}
