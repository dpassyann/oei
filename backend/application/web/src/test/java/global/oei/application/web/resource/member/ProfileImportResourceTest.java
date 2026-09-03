package global.oei.application.web.resource.member;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.member.adapter.ProfileImportAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.profile.Availability;
import global.oei.domain.shared.profile.ProfessionalProfile;
import global.oei.domain.shared.profile.ProfileSource;
import global.oei.domain.shared.profileimport.ProfileImport;
import global.oei.domain.shared.profileimport.ProfileImportSource;
import global.oei.domain.shared.profileimport.ProfileImportStatus;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Standalone {@code MockMvc} test for {@link ProfileImportResource} — see
 * {@code MemberWalletResourceTest}'s Javadoc for why this style.
 */
class ProfileImportResourceTest {

    private static final String MEMBER_ID = "f267e070-2fd5-5f83-a48b-9a733db64489";

    private ProfileImportAdapter profileImportAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        profileImportAdapter = mock(ProfileImportAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new ProfileImportResource(profileImportAdapter)).build();
    }

    @Test
    void initiateProfileImportFromCv_returnsAcceptedSessionAtDocumentUploaded() throws Exception {
        final var memberId = new MemberId(UUID.fromString(MEMBER_ID));
        final ProfileImport session = ProfileImport.create("import-1", memberId, ProfileImportSource.CV_PDF, Instant.now())
                .transitionTo(ProfileImportStatus.DOCUMENT_UPLOADED, Instant.now(), null);
        when(profileImportAdapter.initiateFromCv(ProfileImportSource.CV_PDF)).thenReturn(session);

        mockMvc.perform(multipart("/api/member/v1/profile-import/cv")
                        .file(new MockMultipartFile("file", "cv.pdf", "application/pdf", "content".getBytes())))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.id").value("import-1"))
                .andExpect(jsonPath("$.status").value("DOCUMENT_UPLOADED"));
    }

    @Test
    void initiateProfileImportFromCv_rejectsUnsupportedDocumentType() throws Exception {
        mockMvc.perform(multipart("/api/member/v1/profile-import/cv")
                        .file(new MockMultipartFile("file", "cv.txt", "text/plain", "content".getBytes())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getProfileImport_returnsSessionWhenFound() throws Exception {
        final var memberId = new MemberId(UUID.fromString(MEMBER_ID));
        final ProfileImport session = ProfileImport.create("import-1", memberId, ProfileImportSource.CV_PDF, Instant.now());
        when(profileImportAdapter.getMyProfileImport("import-1")).thenReturn(Optional.of(session));

        mockMvc.perform(get("/api/member/v1/profile-import/import-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CREATED"));
    }

    @Test
    void getProfileImport_returnsNotFoundWhenAbsentOrNotOwnedByCaller() throws Exception {
        when(profileImportAdapter.getMyProfileImport(any())).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/member/v1/profile-import/import-1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void importLinkedinCallback_forwardsAuthorizationCodeAndRedirectUri() throws Exception {
        final var memberId = new MemberId(UUID.fromString(MEMBER_ID));
        final ProfessionalProfile importedProfile = new ProfessionalProfile(
                memberId,
                ProfileSource.LINKEDIN_BASIC,
                "titre",
                "resume",
                null,
                Availability.NOT_AVAILABLE,
                java.util.List.of(),
                java.util.List.of(),
                java.util.List.of(),
                java.util.List.of(),
                java.util.List.of(),
                java.util.List.of(),
                java.util.List.of(),
                null,
                0);
        when(profileImportAdapter.importLinkedinBasicWithAuthorizationCode("oauth-code", "http://localhost/callback"))
                .thenReturn(importedProfile);

        mockMvc.perform(post("/api/member/v1/profile-import/linkedin/basic/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"authorizationCode":"oauth-code","redirectUri":"http://localhost/callback"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.memberId").value(MEMBER_ID));

        verify(profileImportAdapter).importLinkedinBasicWithAuthorizationCode("oauth-code", "http://localhost/callback");
    }
}
