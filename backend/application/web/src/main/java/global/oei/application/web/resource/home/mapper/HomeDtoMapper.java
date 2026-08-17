package global.oei.application.web.resource.home.mapper;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.DomainAreaDTO;
import global.oei.application.web.model.DomainSectionDTO;
import global.oei.application.web.model.NewsItemDTO;
import global.oei.application.web.model.PartnerDTO;
import global.oei.application.web.model.RelatedResourceDTO;
import global.oei.application.web.model.StatDTO;
import global.oei.domain.shared.home.HomeDomainArea;
import global.oei.domain.shared.home.HomeDomainAreaDetail;
import global.oei.domain.shared.home.HomeDomainSection;
import global.oei.domain.shared.home.HomeNewsItem;
import global.oei.domain.shared.home.HomePartner;
import global.oei.domain.shared.home.HomeRelatedNewsItem;
import global.oei.domain.shared.home.HomeRelatedResource;
import global.oei.domain.shared.home.HomeStat;

@UtilityClass
public class HomeDtoMapper {

    public StatDTO toDto(final HomeStat stat) {
        return new StatDTO(stat.label(), (int) stat.value());
    }

    public DomainAreaDTO toDto(final HomeDomainArea domainArea) {
        final DomainAreaDTO dto = new DomainAreaDTO(
                domainArea.slug(), domainArea.icon(), domainArea.title(), domainArea.description(), domainArea.lastModified());
        return dto;
    }

    public DomainAreaDTO toDto(final HomeDomainAreaDetail domainArea) {
        final DomainAreaDTO dto = new DomainAreaDTO(
                domainArea.slug(), domainArea.icon(), domainArea.title(), domainArea.description(), domainArea.lastModified());
        dto.setSubtitle(domainArea.subtitle());
        dto.setSections(domainArea.sections().stream().map(HomeDtoMapper::toDto).toList());
        dto.setRelatedResources(domainArea.relatedResources().stream().map(HomeDtoMapper::toDto).toList());
        dto.setRelatedNews(domainArea.relatedNews().stream().map(HomeDtoMapper::toDto).toList());
        if (domainArea.isContentFallback() != null) {
            dto.setIsContentFallback(domainArea.isContentFallback());
        }
        return dto;
    }

    public DomainSectionDTO toDto(final HomeDomainSection section) {
        final DomainSectionDTO dto = new DomainSectionDTO(section.id(), section.title(), section.paragraphs());
        dto.setBullets(section.bullets());
        return dto;
    }

    public RelatedResourceDTO toDto(final HomeRelatedResource resource) {
        return new RelatedResourceDTO(resource.title(), resource.description(), resource.path());
    }


    public NewsItemDTO toDto(final HomeNewsItem news) {
        final NewsItemDTO dto = new NewsItemDTO(news.title(), news.excerpt(), news.imageUrl(), news.path());
        if (news.category() != null) {
            dto.setCategory(NewsItemDTO.CategoryEnum.fromValue(news.category()));
        }
        dto.setPublishedAt(news.publishedAt());
        return dto;
    }

    public NewsItemDTO toDto(final HomeRelatedNewsItem news) {
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
