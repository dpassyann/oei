package global.oei.infrastructure.persistence.store;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.store.BusinessCardTemplate;
import global.oei.domain.shared.store.FulfillmentKind;
import global.oei.domain.shared.store.Product;
import global.oei.domain.shared.store.ProductCategory;
import global.oei.domain.shared.store.ProductPort;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductPersistenceAdapter implements ProductPort {

    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final BusinessCardTemplateRepository businessCardTemplateRepository;

    @Override
    public List<ProductCategory> findAllCategories() {
        return categoryRepository.findAll().stream().map(ProductPersistenceAdapter::toDomain).toList();
    }

    @Override
    public List<Product> findAllProducts(final String categoryCode) {
        if (categoryCode == null) {
            return productRepository.findAll().stream().map(ProductPersistenceAdapter::toDomain).toList();
        }
        return categoryRepository.findByCode(categoryCode)
                .map(category -> productRepository.findByCategoryId(category.getId()).stream().map(ProductPersistenceAdapter::toDomain).toList())
                .orElseGet(List::of);
    }

    @Override
    public Optional<Product> findProductById(final String id) {
        return productRepository.findById(UUID.fromString(id)).map(ProductPersistenceAdapter::toDomain);
    }

    @Override
    public List<BusinessCardTemplate> findAllBusinessCardTemplates() {
        return businessCardTemplateRepository.findAll().stream().map(ProductPersistenceAdapter::toDomain).toList();
    }

    @Override
    public Optional<BusinessCardTemplate> findBusinessCardTemplateById(final String id) {
        return businessCardTemplateRepository.findById(UUID.fromString(id)).map(ProductPersistenceAdapter::toDomain);
    }

    private static ProductCategory toDomain(final ProductCategoryEntity entity) {
        return new ProductCategory(
                entity.getId().toString(), entity.getCode(), entity.getLabel(), FulfillmentKind.valueOf(entity.getFulfillmentKind()));
    }

    private static Product toDomain(final ProductEntity entity) {
        return new Product(
                entity.getId().toString(), entity.getCategoryId().toString(), entity.getSku(), entity.getName(), entity.getDescription(),
                entity.getUnitPriceAmount(), entity.getUnitPriceCurrency(), entity.isActive(), entity.isCustomizable());
    }

    private static BusinessCardTemplate toDomain(final BusinessCardTemplateEntity entity) {
        return new BusinessCardTemplate(entity.getId().toString(), entity.getName(), entity.getPreviewUrl());
    }
}
