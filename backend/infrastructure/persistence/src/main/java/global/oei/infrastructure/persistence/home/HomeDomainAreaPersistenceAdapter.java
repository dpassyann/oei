package global.oei.infrastructure.persistence.home;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.home.HomeDomainArea;
import global.oei.domain.shared.home.HomeDomainAreaPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeDomainAreaPersistenceAdapter implements HomeDomainAreaPort {

    private final HomeDomainAreaRepository repository;

    @Override
    public List<HomeDomainArea> findByLang(final String lang) {
        return repository.findByLangOrderByDisplayOrderAsc(lang).stream()
                .map(entity -> new HomeDomainArea(
                        entity.getSlug(), entity.getLang(), entity.getIcon(), entity.getTitle(), entity.getDescription(),
                        entity.getLastModified()))
                .toList();
    }
}
