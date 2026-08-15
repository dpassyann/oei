package global.oei.infrastructure.persistence.content;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentCommentRepository extends JpaRepository<ContentCommentEntity, UUID> {

    List<ContentCommentEntity> findByContributionId(UUID contributionId);
}
