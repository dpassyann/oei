package global.oei.infrastructure.persistence.home;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeLeadRepository extends JpaRepository<HomeLeadEntity, UUID> {
}
