package global.oei.domain.shared.home;

import java.time.LocalDate;
import java.util.Objects;

/**
 * One of the OEI's public domains of action, shown on the home page grid.
 */
public record HomeDomainArea(String slug, String lang, String icon, String title, String description, LocalDate lastModified) {

    public HomeDomainArea {
        Objects.requireNonNull(slug, "slug must not be null");
        Objects.requireNonNull(lang, "lang must not be null");
        Objects.requireNonNull(icon, "icon must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(description, "description must not be null");
        Objects.requireNonNull(lastModified, "lastModified must not be null");
    }
}
