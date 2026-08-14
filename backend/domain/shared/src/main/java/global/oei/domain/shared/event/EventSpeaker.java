package global.oei.domain.shared.event;

import java.util.Objects;

public record EventSpeaker(String name, String role) {

    public EventSpeaker {
        Objects.requireNonNull(name, "name must not be null");
    }
}
