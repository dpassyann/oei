package global.oei.application.web.resource.event;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.config.security.MemberEntitlementGuard;
import global.oei.application.web.config.web.GlobalExceptionHandler;
import global.oei.application.web.resource.event.adapter.EventAdapter;
import global.oei.domain.shared.membership.MembershipEntitlement;

/**
 * Standalone {@code MockMvc} test for {@link MemberEventsResource} — see
 * {@code MemberWalletResourceTest}'s Javadoc for why this style. Only covers server-side
 * entitlement enforcement (docs/audit/MEMBER-SPACE-CURRENT-STATE.md §4); the rest of the
 * resource's behavior has no dedicated test yet.
 */
class MemberEventsResourceTest {

    private EventAdapter eventAdapter;
    private MemberEntitlementGuard entitlementGuard;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        eventAdapter = mock(EventAdapter.class);
        entitlementGuard = mock(MemberEntitlementGuard.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new MemberEventsResource(eventAdapter, entitlementGuard))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // Server-side enforcement of `EVENT_POST` (docs/audit/MEMBER-SPACE-CURRENT-STATE.md §4):
    // a direct API call without the entitlement must be rejected with 403 (never a raw stack
    // trace/500) and must never reach `EventAdapter.createEventPost`.
    @Test
    void createEventPost_returnsForbiddenAsProblemDetailWhenCallerLacksEventPostEntitlement() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "Membership status EXPIRED does not grant EVENT_POST."))
                .when(entitlementGuard).require(MembershipEntitlement.EVENT_POST);

        mockMvc.perform(post("/api/member/v1/events/event-1/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"text":"Great session!"}"""))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.detail").value("Membership status EXPIRED does not grant EVENT_POST."));

        verifyNoInteractions(eventAdapter);
    }
}
