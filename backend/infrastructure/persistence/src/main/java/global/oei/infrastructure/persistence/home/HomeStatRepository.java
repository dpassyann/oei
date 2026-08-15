package global.oei.infrastructure.persistence.home;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeStatRepository extends JpaRepository<HomeStatEntity, UUID> {

    List<HomeStatEntity> findByLangOrderByDisplayOrderAsc(String lang);
}
