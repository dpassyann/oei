package global.oei.infrastructure.persistence.cv;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CvTemplateRepository extends JpaRepository<CvTemplateEntity, String> {
}
