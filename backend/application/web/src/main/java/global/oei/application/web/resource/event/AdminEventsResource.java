package global.oei.application.web.resource.event;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.AdminEventsApi;
import global.oei.application.web.model.EventProposalDTO;
import global.oei.application.web.resource.event.adapter.EventAdapter;
import global.oei.application.web.resource.event.mapper.EventDtoMapper;

/**
 * Implements every operation of {@link AdminEventsApi}: no stub left on this interface.
 */
@RestController
@RequiredArgsConstructor
public class AdminEventsResource implements AdminEventsApi {

    private final EventAdapter eventAdapter;

    @Override
    public ResponseEntity<List<EventProposalDTO>> listEventModerationQueue() {
        return ResponseEntity.ok(eventAdapter.listEventModerationQueue().stream().map(EventDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<Void> approveEventProposal(final String id) {
        return eventAdapter.approveEventProposal(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @Override
    public ResponseEntity<Void> hideEventComment(final String id) {
        return eventAdapter.hideEventComment(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
