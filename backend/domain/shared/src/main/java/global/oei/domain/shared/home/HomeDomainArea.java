package global.oei.domain.shared.home;

import java.util.Objects;

/**
 * One of the OEI's 8 domains of action, shown on the public home page.
 */
public record HomeDomainArea(String lang, String icon, String title, String description) {

    public HomeDomainArea {
        Objects.requireNonNull(lang, "lang must not be null");
        Objects.requireNonNull(icon, "icon must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(description, "description must not be null");
    }
}
