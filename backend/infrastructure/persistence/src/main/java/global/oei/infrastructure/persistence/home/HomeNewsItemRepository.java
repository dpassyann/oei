package global.oei.infrastructure.persistence.home;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeNewsItemRepository extends JpaRepository<HomeNewsItemEntity, UUID> {

    List<HomeNewsItemEntity> findByLangOrderByPublishedAtDesc(String lang);
}
