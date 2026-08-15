package global.oei.application.web.resource.cv;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.cv.adapter.CvAdapter;
import global.oei.domain.shared.cv.Cv;
import global.oei.domain.shared.cv.CvStatus;
import global.oei.domain.shared.member.MemberId;

/**
 * Standalone {@code MockMvc} test for {@link CvResource} — see
 * {@code MemberWalletResourceTest}'s Javadoc for why this style.
 */
class CvResourceTest {

    private static final String MEMBER_ID = "f267e070-2fd5-5f83-a48b-9a733db64489";

    private CvAdapter cvAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        cvAdapter = mock(CvAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new CvResource(cvAdapter)).build();
    }

    @Test
    void createCv_returnsCreatedDraftCv() throws Exception {
        final Cv cv = new Cv(
                "cv-1", new MemberId(UUID.fromString(MEMBER_ID)), "tpl-classic", "fr", CvStatus.DRAFT, List.of());
        when(cvAdapter.createCv("tpl-classic", "fr")).thenReturn(cv);

        mockMvc.perform(post("/api/member/v1/cv")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"templateId":"tpl-classic","sourceLanguage":"fr"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("cv-1"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void getCv_returnsNotFoundWhenCvDoesNotBelongToCaller() throws Exception {
        when(cvAdapter.getMyCv(any())).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/member/v1/cv/unknown-id")).andExpect(status().isNotFound());
    }
}
