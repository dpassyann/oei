package global.oei.application.web.resource.event;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.event.adapter.EventAdapter;
import global.oei.domain.shared.event.Event;
import global.oei.domain.shared.event.EventLocation;
import global.oei.domain.shared.event.EventStatus;
import global.oei.domain.shared.event.EventType;
import global.oei.domain.shared.event.EventVisibility;

/**
 * Standalone {@code MockMvc} test for {@link PublicEventsResource} (representative of the 3
 * Events resources) — see {@code MemberWalletResourceTest}'s Javadoc for why this style.
 */
class PublicEventsResourceTest {

    private EventAdapter eventAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        eventAdapter = mock(EventAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new PublicEventsResource(eventAdapter)).build();
    }

    @Test
    void listPublicEvents_returnsPublishedEvents() throws Exception {
        final Event event = new Event(
                "event-1", "colloque-ethique-ia-2026", "Colloque annuel", EventType.COLLOQUE, "Description", null,
                new EventLocation("FR", "Paris", null, null), Instant.parse("2026-09-15T09:00:00Z"),
                Instant.parse("2026-09-15T18:00:00Z"), "Europe/Paris", 150, 2, EventVisibility.PUBLIC, List.of(), List.of(),
                List.of(), EventStatus.REGISTRATION_OPEN, null, null, null, List.of());
        when(eventAdapter.listPublicEvents()).thenReturn(List.of(event));

        mockMvc.perform(get("/api/public/v1/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("colloque-ethique-ia-2026"))
                .andExpect(jsonPath("$[0].status").value("REGISTRATION_OPEN"));
    }
}
