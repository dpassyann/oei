package global.oei.domain.shared.cv;

import java.util.List;

/**
 * Outbound port for the read-only catalog of available {@link CvTemplate}s.
 */
public interface CvTemplateCatalogPort {

    List<CvTemplate> listTemplates();
}
