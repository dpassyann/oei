package global.oei.application.web.resource.member;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.domain.shared.member.AccountType;
import global.oei.domain.shared.member.Member;
import global.oei.domain.shared.member.MemberAlreadyRegisteredException;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.member.RegisterAccountUseCase;

class PublicAccountsResourceTest {

    private RegisterAccountUseCase registerAccountUseCase;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        registerAccountUseCase = mock(RegisterAccountUseCase.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new PublicAccountsResource(registerAccountUseCase)).build();
    }

    @Test
    void registerAccount_returnsCreatedMember() throws Exception {
        final Member member = new Member(
                MemberId.newId(), "nouveau-membre", "nouveau-membre", "nouveau-membre", "fr", "France", AccountType.REAL, Instant.now());
        when(registerAccountUseCase.execute("nouveau-membre@example.org", "fr", "France", true, null)).thenReturn(member);

        mockMvc.perform(post("/api/public/v1/accounts").contentType(MediaType.APPLICATION_JSON).content("""
                {"email":"nouveau-membre@example.org","locale":"fr","country":"France","consentAccepted":true}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.publicSlug").value("nouveau-membre"));
    }

    @Test
    void registerAccount_alreadyRegistered_returnsConflict() throws Exception {
        when(registerAccountUseCase.execute("deja@example.org", "fr", "France", true, null))
                .thenThrow(new MemberAlreadyRegisteredException("already exists"));

        mockMvc.perform(post("/api/public/v1/accounts").contentType(MediaType.APPLICATION_JSON).content("""
                {"email":"deja@example.org","locale":"fr","country":"France","consentAccepted":true}"""))
                .andExpect(status().isConflict());
    }
}
