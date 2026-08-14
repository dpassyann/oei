package global.oei.domain.shared.event;

import java.util.Optional;

public interface EventCommentPort {

    EventComment save(EventComment comment);

    Optional<EventComment> findById(String id);
}
