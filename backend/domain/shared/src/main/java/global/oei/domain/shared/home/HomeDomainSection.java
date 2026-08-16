package global.oei.domain.shared.home;

import java.util.List;
import java.util.Objects;

/**
 * Editorial section rendered in a domain detail page.
 */
public record HomeDomainSection(String id, String title, List<String> paragraphs, List<String> bullets) {

    public HomeDomainSection {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(title, "title must not be null");
        Objects.requireNonNull(paragraphs, "paragraphs must not be null");
    }
}

