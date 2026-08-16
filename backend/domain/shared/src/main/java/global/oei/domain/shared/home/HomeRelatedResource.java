package global.oei.domain.shared.home;

import java.util.Objects;

/**
 * Resource linked from a domain detail page.
 */
public record HomeRelatedResource(String title, String description, String path) {

    public HomeRelatedResource {
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(description, "description must not be null");
        Objects.requireNonNull(path, "path must not be null");
    }
}

