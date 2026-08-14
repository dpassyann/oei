package global.oei.domain.shared.event;

import java.util.List;
import java.util.Optional;

public interface EventPostPort {

    EventPost save(EventPost post);

    Optional<EventPost> findById(String id);

    List<EventPost> findByEventId(String eventId);
}
