package global.oei.infrastructure.persistence.cv;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CvRepository extends JpaRepository<CvEntity, UUID> {

    List<CvEntity> findByMemberId(UUID memberId);
}
