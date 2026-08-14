package global.oei.domain.shared.profile;

import java.util.Objects;

/**
 * A skill listed on a {@link ProfessionalProfile}.
 */
public record Skill(String id, String name, String category, boolean verified) {

    public Skill {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(name, "name must not be null");
        Objects.requireNonNull(category, "category must not be null");
    }
}
