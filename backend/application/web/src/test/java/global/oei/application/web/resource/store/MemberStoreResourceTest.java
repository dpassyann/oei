package global.oei.application.web.resource.store;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.application.web.resource.store.adapter.StoreAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.store.BusinessCardPreview;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderLine;
import global.oei.domain.shared.store.OrderStatus;

/**
 * Standalone {@code MockMvc} test for {@link MemberStoreResource}, following the same pattern as
 * {@code MemberMembershipFeeResourceTest}: no Spring context, a mocked {@link StoreAdapter}.
 */
class MemberStoreResourceTest {

    private static final String ORDER_ID = "order-1";

    private StoreAdapter storeAdapter;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        storeAdapter = mock(StoreAdapter.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new MemberStoreResource(storeAdapter)).build();
    }

    private Order pendingPaymentOrder() {
        final MemberId memberId = new MemberId(UUID.randomUUID());
        final OrderLine line = new OrderLine("line-1", ORDER_ID, "prod-1", 1, BigDecimal.valueOf(9.90), null, null);
        return new Order(ORDER_ID, memberId, List.of(line), BigDecimal.valueOf(9.90), "EUR", OrderStatus.PENDING_PAYMENT, Instant.now(), null);
    }

    @Test
    void generateBusinessCardPreview_returnsNotFoundWhenTemplateMissing() throws Exception {
        when(storeAdapter.generateBusinessCardPreview(org.mockito.ArgumentMatchers.any())).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/member/v1/store/business-card-preview")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"templateId":"missing","displayName":"Jane Doe","title":"CTO","email":"jane@oei.global",
                                 "qrCodeUrl":"https://example.org/qr","membershipTierAtOrder":"GOLD"}"""))
                .andExpect(status().isNotFound());
    }

    @Test
    void generateBusinessCardPreview_returnsHtmlPreview() throws Exception {
        when(storeAdapter.generateBusinessCardPreview(org.mockito.ArgumentMatchers.any()))
                .thenReturn(Optional.of(new BusinessCardPreview("<div>Jane Doe</div>")));

        mockMvc.perform(post("/api/member/v1/store/business-card-preview")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"templateId":"tpl-1","displayName":"Jane Doe","title":"CTO","email":"jane@oei.global",
                                 "qrCodeUrl":"https://example.org/qr","membershipTierAtOrder":"GOLD"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.html").value("<div>Jane Doe</div>"));
    }

    @Test
    void createMyStoreOrder_returnsCreatedOrder() throws Exception {
        when(storeAdapter.createMyOrder(org.mockito.ArgumentMatchers.any())).thenReturn(pendingPaymentOrder());

        mockMvc.perform(post("/api/member/v1/store/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"lines":[{"productId":"prod-1","quantity":1}]}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING_PAYMENT"));
    }

    @Test
    void listMyStoreOrders_returnsHistory() throws Exception {
        when(storeAdapter.listMyOrders()).thenReturn(List.of(pendingPaymentOrder()));

        mockMvc.perform(get("/api/member/v1/store/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(ORDER_ID));
    }

    @Test
    void getMyStoreOrder_returnsNotFoundWhenNotOwned() throws Exception {
        when(storeAdapter.getMyOrder("missing")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/member/v1/store/orders/missing")).andExpect(status().isNotFound());
    }

    @Test
    void payMyStoreOrder_returnsUpdatedOrder() throws Exception {
        final MemberId memberId = new MemberId(UUID.randomUUID());
        final OrderLine line = new OrderLine("line-1", ORDER_ID, "prod-1", 1, BigDecimal.valueOf(9.90), null, null);
        final Order paid = new Order(
                ORDER_ID, memberId, List.of(line), BigDecimal.valueOf(9.90), "EUR", OrderStatus.PENDING_FULFILLMENT, Instant.now(), Instant.now());
        when(storeAdapter.payMyOrder(ORDER_ID, PaymentMethod.CARD, "tok_visa")).thenReturn(Optional.of(paid));

        mockMvc.perform(post("/api/member/v1/store/orders/" + ORDER_ID + "/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"paymentMethod":"CARD","paymentToken":"tok_visa"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_FULFILLMENT"));
    }
}
