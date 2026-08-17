package global.oei.infrastructure.persistence.home;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.home.HomeNewsItem;
import global.oei.domain.shared.home.HomeNewsPort;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeNewsPersistenceAdapter implements HomeNewsPort {

    private final HomeNewsItemRepository repository;

    @Override
    public List<HomeNewsItem> findByLang(final String lang, final Integer limit) {
        final List<HomeNewsItem> items =
                repository.findByLangOrderByPublishedAtDesc(lang).stream().map(HomeNewsPersistenceAdapter::toDomain).toList();
        if (limit == null || limit >= items.size()) {
            return items;
        }
        return items.subList(0, Math.max(limit, 0));
    }

    private static HomeNewsItem toDomain(final HomeNewsItemEntity entity) {
        return new HomeNewsItem(
                entity.getId().toString(), entity.getLang(), entity.getTitle(), entity.getExcerpt(), entity.getImageUrl(),
                entity.getPath(), entity.getCategory(), entity.getPublishedAt());
    }
}
