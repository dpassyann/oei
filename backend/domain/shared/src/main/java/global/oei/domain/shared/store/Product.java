package global.oei.domain.shared.store;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * A catalog item a member (or, in read-only form, a public visitor) can order.
 *
 * <p>{@code active} lets the OEI team retire a product from the catalog without deleting it
 * (already-placed orders keep referencing it); {@code customizable} is {@code true} only for
 * the business card product — every other V1 product (pen, print-cv, print-whitepaper) is
 * ordered as-is.</p>
 */
public record Product(
        String id,
        String categoryId,
        String sku,
        String name,
        String description,
        BigDecimal unitPriceAmount,
        String unitPriceCurrency,
        boolean active,
        boolean customizable) {

    public Product {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(categoryId, "categoryId must not be null");
        Objects.requireNonNull(sku, "sku must not be null");
        Objects.requireNonNull(name, "name must not be null");
        Objects.requireNonNull(unitPriceAmount, "unitPriceAmount must not be null");
        Objects.requireNonNull(unitPriceCurrency, "unitPriceCurrency must not be null");
        if (unitPriceAmount.signum() <= 0) {
            throw new IllegalArgumentException("unitPriceAmount must be positive");
        }
    }
}
