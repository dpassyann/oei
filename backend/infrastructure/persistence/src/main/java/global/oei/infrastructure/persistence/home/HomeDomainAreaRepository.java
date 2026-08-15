package global.oei.infrastructure.persistence.home;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeDomainAreaRepository extends JpaRepository<HomeDomainAreaEntity, UUID> {

    List<HomeDomainAreaEntity> findByLangOrderByDisplayOrderAsc(String lang);
}
