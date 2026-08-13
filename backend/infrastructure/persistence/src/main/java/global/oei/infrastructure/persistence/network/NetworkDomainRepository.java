package global.oei.infrastructure.persistence.network;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NetworkDomainRepository extends JpaRepository<NetworkDomainEntity, String> {
}
