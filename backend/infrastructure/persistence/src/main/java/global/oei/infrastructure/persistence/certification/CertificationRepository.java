package global.oei.infrastructure.persistence.certification;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificationRepository extends JpaRepository<CertificationEntity, UUID> {

    List<CertificationEntity> findByMemberId(UUID memberId);
}
