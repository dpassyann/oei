package global.oei.infrastructure.persistence.store;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.store.BusinessCardCustomization;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderLine;
import global.oei.domain.shared.store.OrderPort;
import global.oei.domain.shared.store.OrderStatus;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderPersistenceAdapter implements OrderPort {

    private final StoreOrderRepository orderRepository;
    private final StoreOrderLineRepository lineRepository;

    @Override
    @Transactional
    public Order save(final Order order) {
        final UUID orderId = UUID.fromString(order.id());
        orderRepository.save(new StoreOrderEntity(
                orderId, order.memberId().value(), order.totalAmount(), order.totalCurrency(), order.status().name(),
                order.createdAt(), order.paidAt()));

        for (final OrderLine line : order.lines()) {
            if (lineRepository.existsById(UUID.fromString(line.id()))) {
                continue;
            }
            final BusinessCardCustomization customization = line.businessCardCustomization();
            lineRepository.save(new StoreOrderLineEntity(
                    UUID.fromString(line.id()), orderId, UUID.fromString(line.productId()), line.quantity(), line.unitPriceAmountAtOrder(),
                    line.sourceReferenceId() == null ? null : UUID.fromString(line.sourceReferenceId()),
                    customization == null ? null : UUID.fromString(customization.templateId()),
                    customization == null ? null : customization.displayName(),
                    customization == null ? null : customization.title(),
                    customization == null ? null : customization.email(),
                    customization == null ? null : customization.phone(),
                    customization == null ? null : customization.qrCodeUrl(),
                    customization == null ? null : customization.membershipTierAtOrder()));
        }
        return order;
    }

    @Override
    public Optional<Order> findById(final String id) {
        final UUID orderId = UUID.fromString(id);
        return orderRepository.findById(orderId).map(entity -> toDomain(entity, lineRepository.findByOrderId(orderId)));
    }

    @Override
    public List<Order> findByMemberId(final MemberId memberId) {
        return orderRepository.findByMemberId(memberId.value()).stream()
                .map(entity -> toDomain(entity, lineRepository.findByOrderId(entity.getId())))
                .toList();
    }

    @Override
    public List<Order> findAll(final OrderStatus status) {
        final List<StoreOrderEntity> entities = status == null ? orderRepository.findAll() : orderRepository.findByStatus(status.name());
        return entities.stream().map(entity -> toDomain(entity, lineRepository.findByOrderId(entity.getId()))).toList();
    }

    private static Order toDomain(final StoreOrderEntity entity, final List<StoreOrderLineEntity> lineEntities) {
        final List<OrderLine> lines = lineEntities.stream().map(OrderPersistenceAdapter::toDomain).toList();
        return new Order(
                entity.getId().toString(), new MemberId(entity.getMemberId()), lines, entity.getTotalAmount(), entity.getTotalCurrency(),
                OrderStatus.valueOf(entity.getStatus()), entity.getCreatedAt(), entity.getPaidAt());
    }

    private static OrderLine toDomain(final StoreOrderLineEntity entity) {
        final BusinessCardCustomization customization = entity.getBusinessCardTemplateId() == null
                ? null
                : new BusinessCardCustomization(
                        entity.getBusinessCardTemplateId().toString(), entity.getBusinessCardDisplayName(), entity.getBusinessCardTitle(),
                        entity.getBusinessCardEmail(), entity.getBusinessCardPhone(), entity.getBusinessCardQrCodeUrl(),
                        entity.getBusinessCardMembershipTierAtOrder());
        return new OrderLine(
                entity.getId().toString(), entity.getOrderId().toString(), entity.getProductId().toString(), entity.getQuantity(),
                entity.getUnitPriceAmountAtOrder(), customization,
                entity.getSourceReferenceId() == null ? null : entity.getSourceReferenceId().toString());
    }
}
