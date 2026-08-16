package global.oei.domain.shared.store;

import java.util.Objects;

/**
 * A server-rendered HTML preview of a {@link BusinessCardCustomization} in progress (same
 * "build in HTML first" filière as the CV renderer). Never a PDF/image regenerated on every
 * keystroke — cheap to (re)compute, not persisted; the final printable render only happens
 * once the order is validated.
 */
public record BusinessCardPreview(String html) {

    public BusinessCardPreview {
        Objects.requireNonNull(html, "html must not be null");
    }
}
