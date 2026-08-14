package global.oei.domain.shared.event;

import java.util.Objects;

/**
 * Where an {@link Event} takes place (physical and/or online).
 */
public record EventLocation(String country, String city, String venue, String onlineUrl) {

    public EventLocation {
        Objects.requireNonNull(country, "country must not be null");
    }
}
