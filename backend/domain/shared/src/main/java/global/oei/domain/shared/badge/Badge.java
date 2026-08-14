package global.oei.domain.shared.badge;

import java.util.Objects;

/**
 * A catalog entry describing an awardable recognition badge.
 */
public record Badge(String id, String code, String name, String description, String iconUrl, BadgeCategory category) {

    public Badge {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(code, "code must not be null");
        Objects.requireNonNull(name, "name must not be null");
        Objects.requireNonNull(category, "category must not be null");
    }
}
