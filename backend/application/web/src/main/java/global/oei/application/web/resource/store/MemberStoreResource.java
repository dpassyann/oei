package global.oei.application.web.resource.store;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.MemberStoreApi;
import global.oei.application.web.model.BusinessCardCustomizationDTO;
import global.oei.application.web.model.BusinessCardPreviewDTO;
import global.oei.application.web.model.CreateOrderRequestDTO;
import global.oei.application.web.model.OrderDTO;
import global.oei.application.web.model.PayOrderRequestDTO;
import global.oei.application.web.resource.store.adapter.StoreAdapter;
import global.oei.application.web.resource.store.mapper.StoreDtoMapper;
import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.store.BusinessCardCustomization;
import global.oei.domain.shared.store.BusinessCardPreview;
import global.oei.domain.shared.store.NewOrderLine;
import global.oei.domain.shared.store.Order;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link MemberStoreApi}: business-card preview, order
 * creation/history, and order payment for the currently authenticated member.
 */
@RestController
@RequiredArgsConstructor
public class MemberStoreResource implements MemberStoreApi {

    private final StoreAdapter storeAdapter;

    @Override
    public ResponseEntity<BusinessCardPreviewDTO> generateBusinessCardPreview(final BusinessCardCustomizationDTO businessCardCustomizationDTO) {
        final BusinessCardCustomization customization = StoreDtoMapper.toDomain(businessCardCustomizationDTO);
        final Optional<BusinessCardPreview> preview = storeAdapter.generateBusinessCardPreview(customization);
        return preview.map(value -> ResponseEntity.ok(StoreDtoMapper.toDto(value))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<OrderDTO> createMyStoreOrder(final CreateOrderRequestDTO createOrderRequestDTO) {
        final List<NewOrderLine> lines = createOrderRequestDTO.getLines().stream().map(StoreDtoMapper::toDomain).toList();
        final Order order = storeAdapter.createMyOrder(lines);
        return ResponseEntity.status(HttpStatus.CREATED).body(StoreDtoMapper.toDto(order));
    }

    @Override
    public ResponseEntity<List<OrderDTO>> listMyStoreOrders() {
        return ResponseEntity.ok(storeAdapter.listMyOrders().stream().map(StoreDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<OrderDTO> getMyStoreOrder(final String id) {
        return storeAdapter.getMyOrder(id).map(order -> ResponseEntity.ok(StoreDtoMapper.toDto(order)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<OrderDTO> payMyStoreOrder(final String id, final PayOrderRequestDTO payOrderRequestDTO) {
        final PaymentMethod paymentMethod = PaymentMethod.valueOf(payOrderRequestDTO.getPaymentMethod().name());
        return storeAdapter.payMyOrder(id, paymentMethod, payOrderRequestDTO.getPaymentToken())
                .map(order -> ResponseEntity.ok(StoreDtoMapper.toDto(order)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
