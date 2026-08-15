package global.oei.domain.shared.home;

import java.util.List;

/**
 * Outbound port for public home-page news items, most-recent first.
 */
public interface HomeNewsPort {

    List<HomeNewsItem> findByLang(String lang, Integer limit);
}
