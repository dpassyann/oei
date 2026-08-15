package global.oei.application.web.resource.member;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.member.adapter.AdminMembersAdapter;
import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberId;

class AdminMembersResourceTest {

    private AdminMembersAdapter adminMembersAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        adminMembersAdapter = mock(AdminMembersAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new AdminMembersResource(adminMembersAdapter)).build();
    }

    @Test
    void listAdminMembers_returnsAllMembers() throws Exception {
        final Member member = new Member(
                MemberId.newId(), "jane-doe", "Jane Doe", "Jane Doe", "fr", "France", AccountType.REAL, Instant.now());
        when(adminMembersAdapter.listAdminMembers()).thenReturn(List.of(member));

        mockMvc.perform(get("/api/admin/v1/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].publicSlug").value("jane-doe"));
    }

    @Test
    void awardBadge_returnsCreatedAward() throws Exception {
        final var award = new global.oei.domain.shared.badge.BadgeAward(
                "award-1", "badge-1", MemberId.newId(), Instant.now(), global.oei.domain.shared.badge.BadgeAwardSource.MANUAL, "admin-1",
                false);
        when(adminMembersAdapter.awardBadge(eq("member-1"), eq("badge-1"))).thenReturn(award);

        mockMvc.perform(post("/api/admin/v1/badges/member-1/award")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("""
                                {"badgeId":"badge-1"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("award-1"));
    }

    @Test
    void validateCertification_notFound_returns404() throws Exception {
        when(adminMembersAdapter.validateCertification("cert-unknown")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/admin/v1/certifications/cert-unknown/validate")).andExpect(status().isNotFound());
    }
}
