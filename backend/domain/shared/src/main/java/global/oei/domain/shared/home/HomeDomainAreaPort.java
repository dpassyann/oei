package global.oei.domain.shared.home;

import java.util.List;

/**
 * Outbound port for the OEI's 8 public domains of action.
 */
public interface HomeDomainAreaPort {

    List<HomeDomainArea> findByLang(String lang);
}
