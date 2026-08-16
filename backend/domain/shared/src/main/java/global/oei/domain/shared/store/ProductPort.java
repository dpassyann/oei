package global.oei.domain.shared.store;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for the read-mostly product catalog (categories, products, business-card
 * templates).
 */
public interface ProductPort {

    List<ProductCategory> findAllCategories();

    List<Product> findAllProducts(String categoryCode);

    Optional<Product> findProductById(String id);

    List<BusinessCardTemplate> findAllBusinessCardTemplates();

    Optional<BusinessCardTemplate> findBusinessCardTemplateById(String id);
}
