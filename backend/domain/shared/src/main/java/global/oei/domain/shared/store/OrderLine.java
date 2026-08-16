package global.oei.domain.shared.store;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * One line of an {@link Order}. {@code unitPriceAmountAtOrder} is captured at order time and
 * must never vary afterwards even if the catalog price later changes.
 *
 * <p>{@code businessCardCustomization} is non-null only for a business-card product line, and
 * is immutable once the order exists — any further personalization desire creates a new order,
 * never a retroactive edit. {@code sourceReferenceId} is non-null only for the print-cv product
 * (it references the member's existing {@code Cv} id); it stays {@code null} for every other
 * product, including print-whitepaper (same content for everyone).</p>
 */
public record OrderLine(
        String id,
        String orderId,
        String productId,
        int quantity,
        BigDecimal unitPriceAmountAtOrder,
        BusinessCardCustomization businessCardCustomization,
        String sourceReferenceId) {

    public OrderLine {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(orderId, "orderId must not be null");
        Objects.requireNonNull(productId, "productId must not be null");
        Objects.requireNonNull(unitPriceAmountAtOrder, "unitPriceAmountAtOrder must not be null");
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity must be positive");
        }
        if (unitPriceAmountAtOrder.signum() <= 0) {
            throw new IllegalArgumentException("unitPriceAmountAtOrder must be positive");
        }
    }

    /**
     * @return {@link #unitPriceAmountAtOrder()} multiplied by {@link #quantity()}
     */
    public BigDecimal lineTotal() {
        return unitPriceAmountAtOrder.multiply(BigDecimal.valueOf(quantity));
    }
}
