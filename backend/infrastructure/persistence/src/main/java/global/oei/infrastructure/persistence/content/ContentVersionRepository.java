package global.oei.infrastructure.persistence.content;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentVersionRepository extends JpaRepository<ContentVersionEntity, UUID> {

    List<ContentVersionEntity> findByContentId(UUID contentId);
}
