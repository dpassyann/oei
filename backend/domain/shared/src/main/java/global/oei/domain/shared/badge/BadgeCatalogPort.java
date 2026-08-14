package global.oei.domain.shared.badge;

import java.util.List;

/**
 * Outbound port for the read-only {@link Badge} catalog.
 */
public interface BadgeCatalogPort {

    List<Badge> listCatalog();
}
