package global.oei.application.web.resource.search;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentSourceType;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentWorkflowStatus;
import global.oei.domain.shared.home.HomeNewsItem;
import global.oei.domain.shared.home.HomeNewsPort;

class SearchResourceTest {

    private ContentPort contentPort;
    private HomeNewsPort homeNewsPort;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        contentPort = mock(ContentPort.class);
        homeNewsPort = mock(HomeNewsPort.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new SearchResource(contentPort, homeNewsPort)).build();
    }

    @Test
    void searchPublicContent_groupsResourcesAndNews() throws Exception {
        final Content article = new Content(
                "content-1", ContentType.ARTICLE, "gouvernance-ia", ContentSourceType.CMS, "Gouvernance de l'IA", List.of(), null, null,
                ContentWorkflowStatus.PUBLISHED);
        when(contentPort.search(any(), any(), any(), any(), anyString())).thenReturn(List.of(article));
        final HomeNewsItem news = new HomeNewsItem(
                "news-1", "fr", "Gouvernance annoncée", "extrait", "https://mock-media.oei.local/x.jpg", "/actualites/gouvernance",
                "communique", LocalDate.now());
        when(homeNewsPort.findByLang("fr", null)).thenReturn(List.of(news));

        mockMvc.perform(get("/api/public/v1/search").param("q", "gouvernance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
