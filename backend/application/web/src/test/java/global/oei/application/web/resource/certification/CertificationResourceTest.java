package global.oei.application.web.resource.certification;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;

import global.oei.application.web.resource.certification.adapter.CertificationAdapter;
import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationStatus;
import global.oei.domain.shared.member.MemberId;

/**
 * Standalone {@code MockMvc} test for {@link CertificationResource} — see
 * {@code MemberWalletResourceTest}'s Javadoc for why this style (no Spring context booted at
 * all, only the resource + a mocked {@link CertificationAdapter}).
 */
class CertificationResourceTest {

    private static final String MEMBER_ID = "f267e070-2fd5-5f83-a48b-9a733db64489";

    private CertificationAdapter certificationAdapter;
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        certificationAdapter = mock(CertificationAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new CertificationResource(certificationAdapter)).build();
    }

    @Test
    void declareCertification_returnsCreatedCertification() throws Exception {
        final Certification certification = new Certification(
                "cert-1", new MemberId(java.util.UUID.fromString(MEMBER_ID)), "AWS Certified Solutions Architect", "Amazon",
                null, LocalDate.of(2026, 1, 1), null, null, CertificationStatus.DECLARED, null, null);
        when(certificationAdapter.declareCertification(
                        "AWS Certified Solutions Architect", "Amazon", null, LocalDate.of(2026, 1, 1), null, null))
                .thenReturn(certification);

        final String body = """
                {"name":"AWS Certified Solutions Architect","issuingOrganization":"Amazon","issuedAt":"2026-01-01"}""";

        mockMvc.perform(post("/api/member/v1/certifications").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("cert-1"))
                .andExpect(jsonPath("$.status").value("DECLARED"));
    }

    @Test
    void getMyCertification_returnsNotFoundWhenAbsent() throws Exception {
        when(certificationAdapter.getMyCertification(any())).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/member/v1/certifications/unknown-id")).andExpect(status().isNotFound());
    }
}
