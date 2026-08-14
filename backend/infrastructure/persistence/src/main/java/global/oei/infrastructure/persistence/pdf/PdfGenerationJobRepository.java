package global.oei.infrastructure.persistence.pdf;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PdfGenerationJobRepository extends JpaRepository<PdfGenerationJobEntity, UUID> {
}
