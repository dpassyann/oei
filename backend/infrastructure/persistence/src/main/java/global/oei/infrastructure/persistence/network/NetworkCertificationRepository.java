package global.oei.infrastructure.persistence.network;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NetworkCertificationRepository extends JpaRepository<NetworkCertificationEntity, String> {

    List<NetworkCertificationEntity> findByDomainId(String domainId);
}
