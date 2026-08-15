package global.oei.application.web.resource.network;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.network.adapter.NetworkGraphAdapter;
import global.oei.application.web.resource.network.adapter.NetworkSalaryAdapter;
import global.oei.domain.shared.network.CompensationPeriod;
import global.oei.domain.shared.network.NetworkSalaryNodeType;
import global.oei.domain.shared.network.SalaryInsight;

/**
 * Standalone {@code MockMvc} test for {@link NetworkResource} — see
 * {@code MemberWalletResourceTest}'s Javadoc for why this style. Covers the salary-insight
 * "value absence" convention: {@code 204} (never an error) when the anonymization threshold
 * is not met, {@code 200} with the aggregate otherwise.
 */
class NetworkResourceTest {

    private NetworkGraphAdapter networkGraphAdapter;
    private NetworkSalaryAdapter networkSalaryAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        networkGraphAdapter = mock(NetworkGraphAdapter.class);
        networkSalaryAdapter = mock(NetworkSalaryAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new NetworkResource(networkGraphAdapter, networkSalaryAdapter)).build();
    }

    @Test
    void getNetworkDomainSalaryInsight_returnsOkWhenThresholdReached() throws Exception {
        final SalaryInsight insight = new SalaryInsight(95000, 130000, "CHF", CompensationPeriod.YEAR, 8, "Suisse");
        when(networkSalaryAdapter.getSalaryInsight(eq(NetworkSalaryNodeType.DOMAIN), eq("ia"), any())).thenReturn(Optional.of(insight));

        mockMvc.perform(get("/api/public/v1/network/domains/ia/salary-insight"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sampleSize").value(8))
                .andExpect(jsonPath("$.currency").value("CHF"));
    }

    @Test
    void getNetworkDomainSalaryInsight_returnsNoContentBelowAnonymizationThreshold() throws Exception {
        when(networkSalaryAdapter.getSalaryInsight(eq(NetworkSalaryNodeType.DOMAIN), eq("niche-domain"), any()))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/public/v1/network/domains/niche-domain/salary-insight")).andExpect(status().isNoContent());
    }

    @Test
    void listNetworkTopicsAndCertifications_returnsNotFoundForUnknownDomain() throws Exception {
        when(networkGraphAdapter.listTopicsAndCertifications("unknown-domain")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/public/v1/network/domains/unknown-domain/topics")).andExpect(status().isNotFound());
    }
}
