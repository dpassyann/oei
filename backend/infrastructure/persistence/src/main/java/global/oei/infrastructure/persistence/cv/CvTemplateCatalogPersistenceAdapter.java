package global.oei.infrastructure.persistence.cv;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.cv.CvTemplate;
import global.oei.domain.shared.cv.CvTemplateCatalogPort;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CvTemplateCatalogPersistenceAdapter implements CvTemplateCatalogPort {

    private final CvTemplateRepository repository;

    @Override
    public List<CvTemplate> listTemplates() {
        return repository.findAll().stream()
                .map(entity -> new CvTemplate(entity.getId(), entity.getCode(), entity.getName(), entity.getPreviewUrl()))
                .toList();
    }
}
