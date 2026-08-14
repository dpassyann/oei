package global.oei.domain.shared.event;

import java.util.Optional;

/**
 * Outbound port for {@link EventComment}.
 */
public interface EventCommentPort {

    EventComment save(EventComment comment);

    Optional<EventComment> findById(String id);
}
