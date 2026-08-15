package global.oei.infrastructure.persistence.home;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.home.HomeStat;
import global.oei.domain.shared.home.HomeStatPort;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeStatPersistenceAdapter implements HomeStatPort {

    private final HomeStatRepository repository;

    @Override
    public List<HomeStat> findByLang(final String lang) {
        return repository.findByLangOrderByDisplayOrderAsc(lang).stream()
                .map(entity -> new HomeStat(entity.getLang(), entity.getLabel(), entity.getValue()))
                .toList();
    }
}
