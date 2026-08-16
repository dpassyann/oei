package global.oei.application.web.resource.store;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.PublicStoreApi;
import global.oei.application.web.model.BusinessCardTemplateDTO;
import global.oei.application.web.model.ProductDTO;
import global.oei.application.web.resource.store.mapper.StoreDtoMapper;
import global.oei.domain.shared.store.Product;
import global.oei.domain.shared.store.ProductPort;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link PublicStoreApi}: read-only catalog, no authentication.
 */
@RestController
@RequiredArgsConstructor
public class PublicStoreResource implements PublicStoreApi {

    private final ProductPort productPort;

    @Override
    public ResponseEntity<List<ProductDTO>> listStoreProducts(final String categoryCode) {
        return ResponseEntity.ok(productPort.findAllProducts(categoryCode).stream().map(StoreDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<ProductDTO> getStoreProduct(final String id) {
        final Optional<Product> product = productPort.findProductById(id);
        return product.map(value -> ResponseEntity.ok(StoreDtoMapper.toDto(value))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<List<BusinessCardTemplateDTO>> listBusinessCardTemplates() {
        return ResponseEntity.ok(productPort.findAllBusinessCardTemplates().stream().map(StoreDtoMapper::toDto).toList());
    }
}
