package global.oei.domain.shared.home;

import java.time.LocalDate;
import java.util.Objects;

/**
 * News teaser linked from a domain detail page.
 */
public record HomeRelatedNewsItem(
        String title, String excerpt, String imageUrl, String path, String category, LocalDate publishedAt) {

    public HomeRelatedNewsItem {
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(excerpt, "excerpt must not be null");
        Objects.requireNonNull(imageUrl, "imageUrl must not be null");
        Objects.requireNonNull(path, "path must not be null");
    }
}

