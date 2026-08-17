package global.oei.application.web.resource.store.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.application.web.resource.store.adapter.StoreAdapter;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.payment.PaymentMethod;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;
import global.oei.domain.shared.store.BusinessCardCustomization;
import global.oei.domain.shared.store.BusinessCardPreview;
import global.oei.domain.shared.store.BusinessCardTemplate;
import global.oei.domain.shared.store.CreateOrderUseCase;
import global.oei.domain.shared.store.GenerateBusinessCardPreviewUseCase;
import global.oei.domain.shared.store.NewOrderLine;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderPort;
import global.oei.domain.shared.store.PayOrderUseCase;
import global.oei.domain.shared.store.ProductPort;

/**
 * Implements {@link StoreAdapter}: resolves the current member from {@link SecurityContextPort}
 * and delegates to the store use cases/ports, refusing access to another member's order.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StoreService implements StoreAdapter {

    private final SecurityContextPort securityContextPort;
    private final ProductPort productPort;
    private final OrderPort orderPort;
    private final CreateOrderUseCase createOrderUseCase;
    private final PayOrderUseCase payOrderUseCase;
    private final GenerateBusinessCardPreviewUseCase generateBusinessCardPreviewUseCase;

    @Override
    public Optional<BusinessCardPreview> generateBusinessCardPreview(final BusinessCardCustomization customization) {
        final Optional<BusinessCardTemplate> template = productPort.findBusinessCardTemplateById(customization.templateId());
        return template.map(value -> generateBusinessCardPreviewUseCase.execute(customization, value));
    }

    @Override
    public Order createMyOrder(final List<NewOrderLine> lines) {
        return createOrderUseCase.execute(currentMemberId(), lines);
    }

    @Override
    public List<Order> listMyOrders() {
        return orderPort.findByMemberId(currentMemberId());
    }

    @Override
    public Optional<Order> getMyOrder(final String orderId) {
        return orderPort.findById(orderId).filter(order -> order.memberId().equals(currentMemberId()));
    }

    @Override
    public Optional<Order> payMyOrder(final String orderId, final PaymentMethod paymentMethod, final String paymentToken) {
        final MemberId memberId = currentMemberId();
        return orderPort.findById(orderId)
                .filter(order -> order.memberId().equals(memberId))
                .map(order -> payOrderUseCase.execute(orderId, memberId, paymentMethod, paymentToken));
    }

    private MemberId currentMemberId() {
        final AuthenticatedIdentity identity = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return MemberId.of(identity.subject());
    }
}
