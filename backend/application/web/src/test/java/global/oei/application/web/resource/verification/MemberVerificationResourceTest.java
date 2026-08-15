package global.oei.application.web.resource.verification;

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

import global.oei.application.web.resource.verification.adapter.VerificationRequestAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.verification.VerificationRequest;
import global.oei.domain.shared.verification.VerificationRequestStatus;
import global.oei.domain.shared.verification.VerificationType;

/**
 * Standalone {@code MockMvc} test for {@link MemberVerificationResource}, following the same
 * pattern as {@code MemberWalletResourceTest}.
 */
class MemberVerificationResourceTest {

    private static final String MEMBER_ID = "f267e070-2fd5-5f83-a48b-9a733db64489";

    private VerificationRequestAdapter verificationRequestAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        verificationRequestAdapter = mock(VerificationRequestAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new MemberVerificationResource(verificationRequestAdapter)).build();
    }

    @Test
    void listMyVerificationRequests_returnsTheMembersRequests() throws Exception {
        final MemberId memberId = new MemberId(UUID.fromString(MEMBER_ID));
        final VerificationRequest request = new VerificationRequest(
                "req-1", memberId, VerificationType.IDENTITY, null, VerificationRequestStatus.PENDING, Instant.now(), null, null);
        when(verificationRequestAdapter.listMyRequests()).thenReturn(List.of(request));

        mockMvc.perform(get("/api/member/v1/verification-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("req-1"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void listMyVerificationRequests_returnsEmptyListWhenNoneSubmitted() throws Exception {
        when(verificationRequestAdapter.listMyRequests()).thenReturn(List.of());

        mockMvc.perform(get("/api/member/v1/verification-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void createVerificationRequest_returnsCreatedPendingRequest() throws Exception {
        final MemberId memberId = new MemberId(UUID.fromString(MEMBER_ID));
        final VerificationRequest created = new VerificationRequest(
                "req-2", memberId, VerificationType.CERTIFICATION, "cert-42", VerificationRequestStatus.PENDING, Instant.now(), null, null);
        when(verificationRequestAdapter.create(VerificationType.CERTIFICATION, "cert-42")).thenReturn(created);

        mockMvc.perform(post("/api/member/v1/verification-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"type":"CERTIFICATION","referenceId":"cert-42"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.type").value("CERTIFICATION"));
    }
}
