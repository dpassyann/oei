package global.oei.infrastructure.persistence.home;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeDomainAreaDetailRepository extends JpaRepository<HomeDomainAreaDetailEntity, UUID> {

    Optional<HomeDomainAreaDetailEntity> findByLangAndSlug(String lang, String slug);
}

