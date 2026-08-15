package global.oei.infrastructure.persistence.home;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeContactMessageRepository extends JpaRepository<HomeContactMessageEntity, UUID> {
}
