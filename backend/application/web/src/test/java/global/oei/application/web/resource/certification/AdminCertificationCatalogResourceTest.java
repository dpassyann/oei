package global.oei.application.web.resource.certification;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.certification.adapter.CertificationAdapter;
import global.oei.domain.shared.certification.CertificationCatalogStatus;
import global.oei.domain.shared.certification.CertificationLevel;
import global.oei.domain.shared.certification.CertificationOeiStatus;
import global.oei.domain.shared.certification.RecognizedCertification;
import global.oei.domain.shared.certification.RecognizedCertificationPage;
import tools.jackson.databind.ObjectMapper;

/**
 * Standalone {@code MockMvc} test for {@link AdminCertificationCatalogResource} — see
 * {@code MemberWalletResourceTest}'s Javadoc for why this style (no Spring context booted at
 * all, only the resource + a mocked {@link CertificationAdapter}).
 */
class AdminCertificationCatalogResourceTest {

    private CertificationAdapter certificationAdapter;
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        certificationAdapter = mock(CertificationAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new AdminCertificationCatalogResource(certificationAdapter)).build();
    }

    private static RecognizedCertification anEntry() {
        return new RecognizedCertification(
                "rc-1", "AWS Certified Solutions Architect", "Amazon Web Services", "AWS-SAA-C03", true, "Cloud & infrastructure",
                CertificationLevel.ARCHITECT, "en", CertificationOeiStatus.OEI_RECOGNIZED, List.of("Architecture cloud"), 36, null,
                "Certification cloud de référence.", CertificationCatalogStatus.PUBLISHED);
    }

    @Test
    void listAdminRecognizedCertifications_returnsAPage() throws Exception {
        when(certificationAdapter.listRecognizedCertificationCatalog(0, 20))
                .thenReturn(new RecognizedCertificationPage(List.of(anEntry()), 0, 20, 1));

        mockMvc.perform(get("/api/admin/v1/certifications/catalog"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].id").value("rc-1"))
                .andExpect(jsonPath("$.pageMetadata.totalItems").value(1));
    }

    @Test
    void createAdminRecognizedCertification_returnsCreatedEntry() throws Exception {
        when(certificationAdapter.createRecognizedCertificationCatalogEntry(
                        eq("CKA"), eq("Linux Foundation"), any(), eq(false), any(), any(), any(), eq(CertificationOeiStatus.OEI_RECOGNIZED),
                        any(), any(), any(), any()))
                .thenReturn(anEntry());

        final String body = """
                {"name":"CKA","issuingOrganization":"Linux Foundation","oeiStatus":"OEI_RECOGNIZED"}""";

        mockMvc.perform(post("/api/admin/v1/certifications/catalog").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("rc-1"));
    }

    @Test
    void updateAdminRecognizedCertification_returnsNotFoundWhenAbsent() throws Exception {
        when(certificationAdapter.updateRecognizedCertificationCatalogEntry(eq("unknown-id"), any())).thenReturn(Optional.empty());

        final String body = """
                {"name":"CKA","issuingOrganization":"Linux Foundation","oeiStatus":"OEI_RECOGNIZED"}""";

        mockMvc.perform(put("/api/admin/v1/certifications/catalog/unknown-id").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void archiveAdminRecognizedCertification_returnsArchivedEntry() throws Exception {
        final RecognizedCertification archived = anEntry().archive();
        when(certificationAdapter.archiveRecognizedCertificationCatalogEntry("rc-1")).thenReturn(Optional.of(archived));

        mockMvc.perform(post("/api/admin/v1/certifications/catalog/rc-1/archive"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.catalogStatus").value("ARCHIVED"));

        verify(certificationAdapter).archiveRecognizedCertificationCatalogEntry("rc-1");
    }
}
