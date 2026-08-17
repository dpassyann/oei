package global.oei.application.web.resource.store;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.AdminStoreApi;
import global.oei.application.web.model.OrderDTO;
import global.oei.application.web.model.OrderStatusDTO;
import global.oei.application.web.resource.store.mapper.StoreDtoMapper;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderPort;
import global.oei.domain.shared.store.OrderStatus;
import global.oei.domain.shared.store.RefundOrderUseCase;

/**
 * Implements every operation of {@link AdminStoreApi}: admin-only supervision of store orders,
 * in particular manual tracking of the mocked fulfillment (which orders are
 * {@link OrderStatus#PENDING_FULFILLMENT}) and full refunds.
 */
@RestController
@RequiredArgsConstructor
public class AdminStoreResource implements AdminStoreApi {

    private final OrderPort orderPort;
    private final RefundOrderUseCase refundOrderUseCase;

    @Override
    public ResponseEntity<List<OrderDTO>> listStoreOrdersForAdmin(final OrderStatusDTO status) {
        return ResponseEntity.ok(orderPort.findAll(OrderStatus.valueOf(status.name())).stream().map(StoreDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<OrderDTO> refundStoreOrder(final String id) {
        final Optional<Order> existing = orderPort.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(StoreDtoMapper.toDto(refundOrderUseCase.execute(id)));
    }
}
