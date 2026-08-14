package global.oei.infrastructure.persistence.content;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentTranslationRepository extends JpaRepository<ContentTranslationEntity, UUID> {

    Optional<ContentTranslationEntity> findByContentVersionIdAndLanguage(UUID contentVersionId, String language);
}
