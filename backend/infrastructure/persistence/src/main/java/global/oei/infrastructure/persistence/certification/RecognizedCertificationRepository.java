package global.oei.infrastructure.persistence.certification;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RecognizedCertificationRepository extends JpaRepository<RecognizedCertificationEntity, UUID> {
}
