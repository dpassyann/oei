package global.oei.infrastructure.persistence.home;

import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import tools.jackson.databind.ObjectMapper;

import global.oei.domain.shared.home.HomeDomainAreaDetail;
import global.oei.domain.shared.home.HomeDomainAreaDetailPort;
import global.oei.domain.shared.home.HomeDomainSection;
import global.oei.domain.shared.home.HomeRelatedNewsItem;
import global.oei.domain.shared.home.HomeRelatedResource;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeDomainAreaDetailPersistenceAdapter implements HomeDomainAreaDetailPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final HomeDomainAreaRepository areaRepository;
    private final HomeDomainAreaDetailRepository detailRepository;

    @Override
    public Optional<HomeDomainAreaDetail> findByLangAndSlug(final String lang, final String slug) {
        return areaRepository.findByLangAndSlug(lang, slug)
                .flatMap(area -> detailRepository.findByLangAndSlug(lang, slug).map(detail -> toDomain(area, detail)));
    }

    @SneakyThrows
    private HomeDomainAreaDetail toDomain(final HomeDomainAreaEntity area, final HomeDomainAreaDetailEntity detail) {
        final List<HomeDomainSection> sections = OBJECT_MAPPER.readValue(
                detail.getSectionsJson(),
                OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, HomeDomainSection.class));
        final List<HomeRelatedResource> relatedResources = OBJECT_MAPPER.readValue(
                detail.getRelatedResourcesJson(),
                OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, HomeRelatedResource.class));
        final List<HomeRelatedNewsItem> relatedNews = OBJECT_MAPPER.readValue(
                detail.getRelatedNewsJson(),
                OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, HomeRelatedNewsItem.class));
        return new HomeDomainAreaDetail(
                area.getSlug(),
                area.getLang(),
                area.getIcon(),
                area.getTitle(),
                area.getDescription(),
                area.getLastModified(),
                detail.getSubtitle(),
                sections,
                relatedResources,
                relatedNews,
                detail.getIsContentFallback());
    }
}



