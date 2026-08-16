package global.oei.application.web.resource.home;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.domain.shared.home.ContactMessage;
import global.oei.domain.shared.home.ContactMessagePort;
import global.oei.domain.shared.home.HomeDomainAreaDetailPort;
import global.oei.domain.shared.home.HomeDomainAreaPort;
import global.oei.domain.shared.home.HomeNewsPort;
import global.oei.domain.shared.home.HomePartnerPort;
import global.oei.domain.shared.home.HomeStat;
import global.oei.domain.shared.home.HomeStatPort;
import global.oei.domain.shared.home.Lead;
import global.oei.domain.shared.home.LeadPort;

class HomeLegacyResourceTest {

    private HomeStatPort homeStatPort;
    private HomeDomainAreaPort homeDomainAreaPort;
    private HomeDomainAreaDetailPort homeDomainAreaDetailPort;
    private HomeNewsPort homeNewsPort;
    private HomePartnerPort homePartnerPort;
    private LeadPort leadPort;
    private ContactMessagePort contactMessagePort;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        homeStatPort = mock(HomeStatPort.class);
        homeDomainAreaPort = mock(HomeDomainAreaPort.class);
        homeDomainAreaDetailPort = mock(HomeDomainAreaDetailPort.class);
        homeNewsPort = mock(HomeNewsPort.class);
        homePartnerPort = mock(HomePartnerPort.class);
        leadPort = mock(LeadPort.class);
        contactMessagePort = mock(ContactMessagePort.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new HomeLegacyResource(
                        homeStatPort,
                        homeDomainAreaPort,
                        homeDomainAreaDetailPort,
                        homeNewsPort,
                        homePartnerPort,
                        leadPort,
                        contactMessagePort))
                .build();
    }

    @Test
    void getHomeStats_returnsStatsForLang() throws Exception {
        when(homeStatPort.findByLang("fr")).thenReturn(List.of(new HomeStat("fr", "Membres", 0)));

        mockMvc.perform(get("/api/v1/stats/fr"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].label").value("Membres"))
                .andExpect(jsonPath("$[0].value").value(0));
    }

    @Test
    void submitLead_capturesEmailAndReturnsNoContent() throws Exception {
        when(leadPort.save(org.mockito.ArgumentMatchers.any(Lead.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/v1/leads").contentType(MediaType.APPLICATION_JSON).content("""
                {"email":"visiteur@example.org"}"""))
                .andExpect(status().isNoContent());

        verify(leadPort).save(org.mockito.ArgumentMatchers.any(Lead.class));
    }

    @Test
    void submitContactMessage_capturesMessageAndReturnsNoContent() throws Exception {
        when(contactMessagePort.save(org.mockito.ArgumentMatchers.any(ContactMessage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/v1/contact").contentType(MediaType.APPLICATION_JSON).content("""
                {"name":"Visiteur","email":"visiteur@example.org","message":"Bonjour"}"""))
                .andExpect(status().isNoContent());
    }
}
