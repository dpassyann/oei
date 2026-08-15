package global.oei.domain.shared.home;

import java.util.List;

/**
 * Outbound port for the public home page statistics. See {@link HomeStat}'s Javadoc: every
 * figure is seeded at {@code 0} in this iteration, never computed from real activity yet.
 */
public interface HomeStatPort {

    List<HomeStat> findByLang(String lang);
}
