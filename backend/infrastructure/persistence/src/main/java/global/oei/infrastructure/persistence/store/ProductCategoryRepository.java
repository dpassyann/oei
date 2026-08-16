package global.oei.infrastructure.persistence.store;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCategoryRepository extends JpaRepository<ProductCategoryEntity, UUID> {

    Optional<ProductCategoryEntity> findByCode(String code);
}
