package global.oei.infrastructure.persistence.content;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentContributionRepository extends JpaRepository<ContentContributionEntity, UUID> {

    List<ContentContributionEntity> findByContentId(UUID contentId);
}
