package global.oei.application.web.resource.membershipfee;

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

import global.oei.application.web.resource.membershipfee.adapter.MembershipFeeAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.membershipfee.MembershipFeeAccount;
import global.oei.domain.shared.membershipfee.MembershipFeePayment;
import global.oei.domain.shared.membershipfee.MembershipFeePaymentStatus;
import global.oei.domain.shared.membershipfee.MembershipFeeTier;

/**
 * Standalone {@code MockMvc} test for {@link MemberMembershipFeeResource}, following the same
 * pattern as {@code MemberWalletResourceTest}: no Spring context, real HTTP dispatch/JSON, a
 * mocked {@link MembershipFeeAdapter}.
 */
class MemberMembershipFeeResourceTest {

    private static final String MEMBER_ID = "f267e070-2fd5-5f83-a48b-9a733db64489";

    private MembershipFeeAdapter membershipFeeAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        membershipFeeAdapter = mock(MembershipFeeAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new MemberMembershipFeeResource(membershipFeeAdapter)).build();
    }

    @Test
    void getMyMembershipFeeAccount_returnsAccountWithPayments() throws Exception {
        final MemberId memberId = new MemberId(UUID.fromString(MEMBER_ID));
        final MembershipFeePayment payment = new MembershipFeePayment(
                "payment-1", memberId, 2026, MembershipFeeTier.MEMBER, 50.0, MembershipFeePaymentStatus.PAID, Instant.now());
        when(membershipFeeAdapter.getMyAccount())
                .thenReturn(new MembershipFeeAccount(memberId, MembershipFeeTier.MEMBER, List.of(payment)));

        mockMvc.perform(get("/api/member/v1/membership-fee/account"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tier").value("MEMBER"))
                .andExpect(jsonPath("$.payments[0].id").value("payment-1"));
    }

    @Test
    void getMyMembershipFeeAccount_returnsEmptyPaymentsWhenNoneRecorded() throws Exception {
        final MemberId memberId = new MemberId(UUID.fromString(MEMBER_ID));
        when(membershipFeeAdapter.getMyAccount()).thenReturn(new MembershipFeeAccount(memberId, MembershipFeeTier.MEMBER, List.of()));

        mockMvc.perform(get("/api/member/v1/membership-fee/account"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.payments").isEmpty());
    }

    @Test
    void payMyMembershipFee_returnsCreatedPaidPayment() throws Exception {
        final MemberId memberId = new MemberId(UUID.fromString(MEMBER_ID));
        final MembershipFeePayment payment = new MembershipFeePayment(
                "payment-2", memberId, 2026, MembershipFeeTier.FOUNDING, 250.0, MembershipFeePaymentStatus.PAID, Instant.now());
        when(membershipFeeAdapter.pay(MembershipFeeTier.FOUNDING, 2026, 250.0)).thenReturn(payment);

        mockMvc.perform(post("/api/member/v1/membership-fee/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tier":"FOUNDING","cycleYear":2026,"amount":250.0}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.tier").value("FOUNDING"));
    }
}
