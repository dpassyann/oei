package global.oei.application.web.resource.event;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.PublicEventsApi;
import global.oei.application.web.model.EventDTO;
import global.oei.application.web.resource.event.adapter.EventAdapter;
import global.oei.application.web.resource.event.mapper.EventDtoMapper;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PublicEventsResource implements PublicEventsApi {

    private final EventAdapter eventAdapter;

    @Override
    public ResponseEntity<List<EventDTO>> listPublicEvents() {
        return ResponseEntity.ok(eventAdapter.listPublicEvents().stream().map(EventDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<EventDTO> getPublicEventBySlug(final String slug) {
        return eventAdapter.getPublicEventBySlug(slug).map(EventDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
