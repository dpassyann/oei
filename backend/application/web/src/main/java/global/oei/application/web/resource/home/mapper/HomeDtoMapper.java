package global.oei.application.web.resource.home.mapper;

import global.oei.application.web.model.DomainAreaDTO;
import global.oei.application.web.model.NewsItemDTO;
import global.oei.application.web.model.PartnerDTO;
import global.oei.application.web.model.StatDTO;
import global.oei.domain.shared.home.HomeDomainArea;
import global.oei.domain.shared.home.HomeNewsItem;
import global.oei.domain.shared.home.HomePartner;
import global.oei.domain.shared.home.HomeStat;
import lombok.experimental.UtilityClass;

@UtilityClass
public class HomeDtoMapper {

    public StatDTO toDto(final HomeStat stat) {
        return new StatDTO(stat.label(), (int) stat.value());
    }

    public DomainAreaDTO toDto(final HomeDomainArea domainArea) {
        return new DomainAreaDTO(domainArea.icon(), domainArea.title(), domainArea.description());
    }

    public NewsItemDTO toDto(final HomeNewsItem news) {
        final NewsItemDTO dto = new NewsItemDTO(news.title(), news.excerpt(), news.imageUrl(), news.path());
        if (news.category() != null) {
            dto.setCategory(NewsItemDTO.CategoryEnum.fromValue(news.category()));
        }
        dto.setPublishedAt(news.publishedAt());
        return dto;
    }

    public PartnerDTO toDto(final HomePartner partner) {
        return new PartnerDTO(partner.id(), partner.name(), partner.logoUrl(), partner.description(), partner.websiteUrl(), partner.category());
    }
}
