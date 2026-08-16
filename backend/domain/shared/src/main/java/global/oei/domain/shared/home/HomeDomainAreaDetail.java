package global.oei.domain.shared.home;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

/**
 * Rich detail payload for a single domain page.
 */
public record HomeDomainAreaDetail(
        String slug,
        String lang,
        String icon,
        String title,
        String description,
        LocalDate lastModified,
        String subtitle,
        List<HomeDomainSection> sections,
        List<HomeRelatedResource> relatedResources,
        List<HomeRelatedNewsItem> relatedNews,
        Boolean isContentFallback) {

    public HomeDomainAreaDetail {
        Objects.requireNonNull(slug, "slug must not be null");
        Objects.requireNonNull(lang, "lang must not be null");
        Objects.requireNonNull(icon, "icon must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(description, "description must not be null");
        Objects.requireNonNull(lastModified, "lastModified must not be null");
        Objects.requireNonNull(sections, "sections must not be null");
        Objects.requireNonNull(relatedResources, "relatedResources must not be null");
        Objects.requireNonNull(relatedNews, "relatedNews must not be null");
    }
}


