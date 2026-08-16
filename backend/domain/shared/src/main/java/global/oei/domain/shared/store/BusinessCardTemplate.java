package global.oei.domain.shared.store;

import java.util.Objects;

/**
 * A predefined visual template a member can pick when customizing a business card ("2-3
 * genuinely polished templates rather than an arbitrary library", same product philosophy as
 * CV templates — see {@code .prompt/plan/02-espace-membre.md §1.2}).
 *
 * <p>A reference entity rather than an enum: new templates are expected to be added by a
 * designer as new assets/rows, not as a code change.</p>
 */
public record BusinessCardTemplate(String id, String name, String previewUrl) {

    public BusinessCardTemplate {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(name, "name must not be null");
        Objects.requireNonNull(previewUrl, "previewUrl must not be null");
    }
}
