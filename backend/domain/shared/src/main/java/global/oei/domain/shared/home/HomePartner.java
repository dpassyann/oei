package global.oei.domain.shared.home;

import java.util.Objects;

/**
 * A partner shown on the public home page. Per this operation's OpenAPI summary, these remain
 * demonstration data until a real partnership is confirmed.
 */
public record HomePartner(String id, String lang, String name, String logoUrl, String description, String websiteUrl, String category) {

    public HomePartner {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(lang, "lang must not be null");
        Objects.requireNonNull(name, "name must not be null");
        Objects.requireNonNull(logoUrl, "logoUrl must not be null");
        Objects.requireNonNull(description, "description must not be null");
        Objects.requireNonNull(websiteUrl, "websiteUrl must not be null");
        Objects.requireNonNull(category, "category must not be null");
    }
}
