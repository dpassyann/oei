package global.oei.domain.shared.home;

import java.time.LocalDate;
import java.util.Objects;

/**
 * A news item shown on the public home page/news list. Kept as its own small aggregate rather
 * than reusing the CMS {@code Content} model (see {@code global.oei.domain.shared.content}):
 * its shape (excerpt/imageUrl/category/publishedAt) does not line up with the CMS workflow
 * model, and the {@code home-legacy} tag's OpenAPI summary explicitly documents it as a
 * legacy/unversioned surface kept unchanged.
 */
public record HomeNewsItem(
        String id, String lang, String title, String excerpt, String imageUrl, String path, String category, LocalDate publishedAt) {

    public HomeNewsItem {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(lang, "lang must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(excerpt, "excerpt must not be null");
        Objects.requireNonNull(imageUrl, "imageUrl must not be null");
        Objects.requireNonNull(path, "path must not be null");
    }
}
