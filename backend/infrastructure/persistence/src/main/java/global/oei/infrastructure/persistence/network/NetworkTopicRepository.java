package global.oei.infrastructure.persistence.network;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NetworkTopicRepository extends JpaRepository<NetworkTopicEntity, String> {

    List<NetworkTopicEntity> findByDomainId(String domainId);
}
