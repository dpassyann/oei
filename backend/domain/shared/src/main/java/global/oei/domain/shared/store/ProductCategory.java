package global.oei.domain.shared.store;

import java.util.Objects;

/**
 * A reference-data catalog category (goodies, business cards, print-and-ship, ...).
 *
 * <p>Deliberately a reference entity, not a closed Java enum: unlike {@code PaymentMethod}
 * (a genuine, domain-owned closed strategy set), the set of store categories is explicitly
 * expected to grow in V2 (attaché-case, t-shirts, ...) as a pure Liquibase data insertion,
 * never a schema/code change — see {@code 01-catalogue-produits.md §1}.</p>
 */
public record ProductCategory(String id, String code, String label, FulfillmentKind fulfillmentKind) {

    public ProductCategory {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(code, "code must not be null");
        Objects.requireNonNull(label, "label must not be null");
        Objects.requireNonNull(fulfillmentKind, "fulfillmentKind must not be null");
    }
}
