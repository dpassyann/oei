package global.oei.application.web.resource.store;

import static org.mockito.ArgumentMatchers.eq;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderLine;
import global.oei.domain.shared.store.OrderPort;
import global.oei.domain.shared.store.OrderStatus;
import global.oei.domain.shared.store.RefundOrderUseCase;

/**
 * Standalone {@code MockMvc} test for {@link AdminStoreResource}, following the same pattern as
 * {@code MemberMembershipFeeResourceTest}: no Spring context, mocked ports.
 */
class AdminStoreResourceTest {

    private static final String ORDER_ID = "order-1";

    private OrderPort orderPort;
    private RefundOrderUseCase refundOrderUseCase;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        orderPort = mock(OrderPort.class);
        refundOrderUseCase = mock(RefundOrderUseCase.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new AdminStoreResource(orderPort, refundOrderUseCase)).build();
    }

    private Order paidOrder(final OrderStatus status) {
        final MemberId memberId = new MemberId(UUID.randomUUID());
        final OrderLine line = new OrderLine("line-1", ORDER_ID, "prod-1", 1, BigDecimal.valueOf(9.90), null, null);
        return new Order(ORDER_ID, memberId, List.of(line), BigDecimal.valueOf(9.90), "EUR", status, Instant.now(), Instant.now());
    }

    @Test
    void listStoreOrdersForAdmin_filtersByStatus() throws Exception {
        when(orderPort.findAll(eq(OrderStatus.PENDING_FULFILLMENT))).thenReturn(List.of(paidOrder(OrderStatus.PENDING_FULFILLMENT)));

        mockMvc.perform(get("/api/admin/v1/store/orders").param("status", "PENDING_FULFILLMENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(ORDER_ID))
                .andExpect(jsonPath("$[0].status").value("PENDING_FULFILLMENT"));
    }

    @Test
    void refundStoreOrder_returnsNotFoundWhenMissing() throws Exception {
        when(orderPort.findById("missing")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/admin/v1/store/orders/missing/refund")).andExpect(status().isNotFound());
    }

    @Test
    void refundStoreOrder_returnsRefundedOrder() throws Exception {
        when(orderPort.findById(ORDER_ID)).thenReturn(Optional.of(paidOrder(OrderStatus.PENDING_FULFILLMENT)));
        when(refundOrderUseCase.execute(ORDER_ID)).thenReturn(paidOrder(OrderStatus.REFUNDED));

        mockMvc.perform(post("/api/admin/v1/store/orders/" + ORDER_ID + "/refund"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REFUNDED"));
    }
}
