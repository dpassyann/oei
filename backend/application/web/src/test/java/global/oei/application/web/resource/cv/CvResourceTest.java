package global.oei.application.web.resource.cv;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.config.security.MemberEntitlementGuard;
import global.oei.application.web.config.web.GlobalExceptionHandler;
import global.oei.application.web.resource.cv.adapter.CvAdapter;
import global.oei.domain.shared.cv.Cv;
import global.oei.domain.shared.cv.CvStatus;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membership.MembershipEntitlement;

/**
 * Standalone {@code MockMvc} test for {@link CvResource} — see
 * {@code MemberWalletResourceTest}'s Javadoc for why this style.
 */
class CvResourceTest {

    private static final String MEMBER_ID = "f267e070-2fd5-5f83-a48b-9a733db64489";

    private CvAdapter cvAdapter;
    private MemberEntitlementGuard entitlementGuard;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        cvAdapter = mock(CvAdapter.class);
        entitlementGuard = mock(MemberEntitlementGuard.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new CvResource(cvAdapter, entitlementGuard))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // Server-side enforcement of `CV_EXPORT_PDF` (docs/audit/MEMBER-SPACE-CURRENT-STATE.md
    // §4): a direct API call without the entitlement must be rejected with 403 (never a raw
    // stack trace/500) and must never reach `CvAdapter.renderCv`.
    @Test
    void renderCv_returnsForbiddenAsProblemDetailWhenCallerLacksCvExportPdfEntitlement() throws Exception {
        org.mockito.Mockito.doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "Membership status EXPIRED does not grant CV_EXPORT_PDF."))
                .when(entitlementGuard).require(MembershipEntitlement.CV_EXPORT_PDF);

        mockMvc.perform(post("/api/member/v1/cv/cv-1/render")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"language":"fr","includeBadges":[]}"""))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.detail").value("Membership status EXPIRED does not grant CV_EXPORT_PDF."));

        verifyNoInteractions(cvAdapter);
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
