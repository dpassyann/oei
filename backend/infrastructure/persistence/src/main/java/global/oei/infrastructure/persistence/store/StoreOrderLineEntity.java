package global.oei.infrastructure.persistence.store;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Flattens {@code global.oei.domain.shared.store.BusinessCardCustomization} into nullable
 * columns (non-null only for a business-card order line) rather than a side table, since it is
 * a single value object with no independent lifecycle of its own.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "store_order_line")
public class StoreOrderLineEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "unit_price_amount_at_order", nullable = false)
    private BigDecimal unitPriceAmountAtOrder;

    @Column(name = "source_reference_id")
    private UUID sourceReferenceId;

    @Column(name = "bc_template_id")
    private UUID businessCardTemplateId;

    @Column(name = "bc_display_name")
    private String businessCardDisplayName;

    @Column(name = "bc_title")
    private String businessCardTitle;

    @Column(name = "bc_email")
    private String businessCardEmail;

    @Column(name = "bc_phone")
    private String businessCardPhone;

    @Column(name = "bc_qr_code_url")
    private String businessCardQrCodeUrl;

    @Column(name = "bc_membership_tier_at_order")
    private String businessCardMembershipTierAtOrder;
}
