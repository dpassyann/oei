package global.oei.domain.shared.cv;

import java.util.Objects;

/**
 * A catalog entry describing a CV rendering template (layout/typography), independent of any
 * member's actual {@link Cv} data. Reference/catalog data, seeded by demo data — never
 * created by members.
 */
public record CvTemplate(String id, String code, String name, String previewUrl) {

    public CvTemplate {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(code, "code must not be null");
        Objects.requireNonNull(name, "name must not be null");
    }
}
