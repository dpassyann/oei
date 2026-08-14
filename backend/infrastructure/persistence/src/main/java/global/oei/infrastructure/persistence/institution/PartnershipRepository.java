package global.oei.infrastructure.persistence.institution;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnershipRepository extends JpaRepository<PartnershipEntity, UUID> {
}
