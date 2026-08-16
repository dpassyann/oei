package global.oei.application.web.resource.store.mapper;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import global.oei.application.web.model.BusinessCardCustomizationDTO;
import global.oei.application.web.model.BusinessCardPreviewDTO;
import global.oei.application.web.model.BusinessCardTemplateDTO;
import global.oei.application.web.model.FulfillmentKindDTO;
import global.oei.application.web.model.NewOrderLineDTO;
import global.oei.application.web.model.OrderDTO;
import global.oei.application.web.model.OrderLineDTO;
import global.oei.application.web.model.OrderStatusDTO;
import global.oei.application.web.model.ProductCategoryDTO;
import global.oei.application.web.model.ProductDTO;
import global.oei.domain.shared.store.BusinessCardCustomization;
import global.oei.domain.shared.store.BusinessCardPreview;
import global.oei.domain.shared.store.BusinessCardTemplate;
import global.oei.domain.shared.store.FulfillmentKind;
import global.oei.domain.shared.store.NewOrderLine;
import global.oei.domain.shared.store.Order;
import global.oei.domain.shared.store.OrderLine;
import global.oei.domain.shared.store.ProductCategory;
import lombok.experimental.UtilityClass;

/**
 * Maps between the store's {@code domain-shared} types and their generated OpenAPI DTOs.
 */
@UtilityClass
public class StoreDtoMapper {

    public ProductCategoryDTO toDto(final ProductCategory category) {
        return new ProductCategoryDTO(category.id(), category.code(), category.label(), toDto(category.fulfillmentKind()));
    }

    public FulfillmentKindDTO toDto(final FulfillmentKind kind) {
        return FulfillmentKindDTO.valueOf(kind.name());
    }

    public ProductDTO toDto(final global.oei.domain.shared.store.Product product) {
        final ProductDTO dto = new ProductDTO(
                product.id(), product.categoryId(), product.sku(), product.name(),
                product.unitPriceAmount(), product.unitPriceCurrency(), product.active(), product.customizable());
        dto.setDescription(product.description());
        return dto;
    }

    public BusinessCardTemplateDTO toDto(final BusinessCardTemplate template) {
        return new BusinessCardTemplateDTO(template.id(), template.name(), template.previewUrl());
    }

    public BusinessCardPreviewDTO toDto(final BusinessCardPreview preview) {
        return new BusinessCardPreviewDTO(preview.html());
    }

    public BusinessCardCustomization toDomain(final BusinessCardCustomizationDTO dto) {
        return new BusinessCardCustomization(
                dto.getTemplateId(), dto.getDisplayName(), dto.getTitle(), dto.getEmail(), dto.getPhone(),
                dto.getQrCodeUrl(), dto.getMembershipTierAtOrder());
    }

    public BusinessCardCustomizationDTO toDto(final BusinessCardCustomization customization) {
        final BusinessCardCustomizationDTO dto = new BusinessCardCustomizationDTO(
                customization.templateId(), customization.displayName(), customization.title(), customization.email(),
                customization.qrCodeUrl(), customization.membershipTierAtOrder());
        dto.setPhone(customization.phone());
        return dto;
    }

    public NewOrderLine toDomain(final NewOrderLineDTO dto) {
        final BusinessCardCustomization customization =
                dto.getBusinessCardCustomization() == null ? null : toDomain(dto.getBusinessCardCustomization());
        return new NewOrderLine(dto.getProductId(), dto.getQuantity(), customization, dto.getSourceReferenceId());
    }

    public OrderLineDTO toDto(final OrderLine line) {
        final OrderLineDTO dto = new OrderLineDTO(
                line.id(), line.orderId(), line.productId(), line.quantity(), line.unitPriceAmountAtOrder());
        if (line.businessCardCustomization() != null) {
            dto.setBusinessCardCustomization(toDto(line.businessCardCustomization()));
        }
        dto.setSourceReferenceId(line.sourceReferenceId());
        return dto;
    }

    public OrderStatusDTO toDto(final global.oei.domain.shared.store.OrderStatus status) {
        return OrderStatusDTO.valueOf(status.name());
    }

    public OrderDTO toDto(final Order order) {
        final OrderDTO dto = new OrderDTO(
                order.id(), order.memberId().value().toString(), order.lines().stream().map(StoreDtoMapper::toDto).toList(),
                order.totalAmount(), order.totalCurrency(), toDto(order.status()),
                LocalDateTime.ofInstant(order.createdAt(), ZoneOffset.UTC));
        if (order.paidAt() != null) {
            dto.setPaidAt(LocalDateTime.ofInstant(order.paidAt(), ZoneOffset.UTC));
        }
        return dto;
    }
}
