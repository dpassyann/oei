package global.oei.infrastructure.persistence.charter;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EthicalCharterSignatureRepository extends JpaRepository<EthicalCharterSignatureEntity, UUID> {
}
