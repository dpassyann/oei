package global.oei.domain.shared.home;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for public home-page partners.
 */
public interface HomePartnerPort {

    List<HomePartner> findByLang(String lang);

    Optional<HomePartner> findByLangAndId(String lang, String id);
}
