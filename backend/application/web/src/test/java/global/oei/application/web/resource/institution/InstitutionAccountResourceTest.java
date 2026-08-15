package global.oei.application.web.resource.institution;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.institution.adapter.InstitutionAdapter;
import global.oei.domain.shared.institution.Institution;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionWorkflowStatus;

/**
 * Standalone {@code MockMvc} test for {@link InstitutionAccountResource} (representative of
 * the 11 Institution resources) — see {@code MemberWalletResourceTest}'s Javadoc for why
 * this style.
 */
class InstitutionAccountResourceTest {

    private InstitutionAdapter institutionAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        institutionAdapter = mock(InstitutionAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new InstitutionAccountResource(institutionAdapter)).build();
    }

    @Test
    void getMyInstitutionAccount_returnsInstitutionResolvedFromCaller() throws Exception {
        final Institution institution = new Institution(
                new InstitutionId(UUID.fromString("27af46da-8426-55c1-b2fb-aa3814e0d1bc")), "OEI Démonstration SA",
                "OEI Démonstration — Institution", null, "CH", List.of("banking"), null, List.of(), "demo-institution", true,
                InstitutionWorkflowStatus.ACTIVE);
        when(institutionAdapter.getMyInstitution()).thenReturn(institution);

        mockMvc.perform(get("/api/institution/v1/account"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publicSlug").value("demo-institution"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void getMyPartnership_returnsNotFoundWhenNoPartnershipYet() throws Exception {
        when(institutionAdapter.getMyPartnership()).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/institution/v1/partnership")).andExpect(status().isNotFound());
    }
}
