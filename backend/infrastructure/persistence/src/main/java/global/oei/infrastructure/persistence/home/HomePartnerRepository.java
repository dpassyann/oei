package global.oei.infrastructure.persistence.home;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HomePartnerRepository extends JpaRepository<HomePartnerEntity, UUID> {

    List<HomePartnerEntity> findByLang(String lang);

    Optional<HomePartnerEntity> findByLangAndExternalId(String lang, String externalId);
}
