package global.oei.infrastructure.persistence.store;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessCardTemplateRepository extends JpaRepository<BusinessCardTemplateEntity, UUID> {
}
