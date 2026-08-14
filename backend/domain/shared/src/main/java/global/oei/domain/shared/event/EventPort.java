package global.oei.domain.shared.event;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for {@link Event}.
 */
public interface EventPort {

    Event save(Event event);

    Optional<Event> findById(String id);

    Optional<Event> findBySlug(String slug);

    List<Event> findAll();

    List<Event> findPublished();
}
