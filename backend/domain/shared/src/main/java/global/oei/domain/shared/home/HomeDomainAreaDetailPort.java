package global.oei.domain.shared.home;

import java.util.Optional;

/**
 * Outbound port for rich domain-area detail pages.
 */
public interface HomeDomainAreaDetailPort {

    Optional<HomeDomainAreaDetail> findByLangAndSlug(String lang, String slug);
}

