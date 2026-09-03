package global.oei.application.web.resource.event;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.MemberEventsApi;
import global.oei.application.web.config.security.MemberEntitlementGuard;
import global.oei.application.web.model.EventCommentDTO;
import global.oei.application.web.model.EventCommentDraftDTO;
import global.oei.application.web.model.EventPhotoConsentDTO;
import global.oei.application.web.model.EventPostDTO;
import global.oei.application.web.model.EventPostDraftDTO;
import global.oei.application.web.model.EventProposalDTO;
import global.oei.application.web.model.EventProposalDraftDTO;
import global.oei.application.web.model.EventRegistrationDTO;
import global.oei.application.web.model.LikeEventPostRequestDTO;
import global.oei.application.web.resource.event.adapter.EventAdapter;
import global.oei.application.web.resource.event.mapper.EventDtoMapper;
import global.oei.domain.shared.event.EventLocation;
import global.oei.domain.shared.event.EventType;
import global.oei.domain.shared.membership.MembershipEntitlement;

/**
 * Implements every operation of {@link MemberEventsApi}: no stub left on this interface.
 * {@link #createEventPost} is gated server-side by {@code EVENT_POST}.
 */
@RestController
@RequiredArgsConstructor
public class MemberEventsResource implements MemberEventsApi {

    private final EventAdapter eventAdapter;
    private final MemberEntitlementGuard entitlementGuard;

    @Override
    public ResponseEntity<EventProposalDTO> submitEventProposal(final EventProposalDraftDTO dto) {
        final var proposal = eventAdapter.submitEventProposal(
                dto.getTitle(), dto.getDescription(), EventType.valueOf(dto.getType().name()), toInstant(dto.getStartAt()),
                toInstant(dto.getEndAt()), dto.getTimezone(),
                new EventLocation(dto.getCountry(), dto.getCity(), dto.getVenue(), dto.getOnlineUrl() == null ? null : dto.getOnlineUrl().toString()),
                dto.getImageUrl() == null ? null : dto.getImageUrl().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(EventDtoMapper.toDto(proposal));
    }

    @Override
    public ResponseEntity<List<EventProposalDTO>> listMyEventProposals() {
        return ResponseEntity.ok(eventAdapter.listMyEventProposals().stream().map(EventDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<EventRegistrationDTO> registerToEvent(final String id) {
        return eventAdapter.registerToEvent(id).map(EventDtoMapper::toDto)
                .map(registration -> ResponseEntity.status(HttpStatus.CREATED).body(registration))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<EventRegistrationDTO> getMyEventRegistration(final String id) {
        return eventAdapter.getMyEventRegistration(id).map(EventDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> unregisterFromEvent(final String id) {
        eventAdapter.unregisterFromEvent(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<EventPostDTO>> listEventFeedPosts(final String id) {
        final var viewer = eventAdapter.currentMemberId();
        return ResponseEntity.ok(eventAdapter.listEventFeedPosts(id).stream().map(post -> EventDtoMapper.toDto(post, viewer)).toList());
    }

    @Override
    public ResponseEntity<EventPostDTO> createEventPost(final String id, final EventPostDraftDTO dto) {
        entitlementGuard.require(MembershipEntitlement.EVENT_POST);
        return eventAdapter.createEventPost(id, dto.getText(), dto.getPhotoUrl() == null ? null : dto.getPhotoUrl().toString())
                .map(post -> EventDtoMapper.toDto(post, eventAdapter.currentMemberId()))
                .map(post -> ResponseEntity.status(HttpStatus.CREATED).body(post))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<EventCommentDTO> addEventComment(final String id, final EventCommentDraftDTO dto) {
        return eventAdapter.addEventComment(id, dto.getPostId(), dto.getText())
                .map(EventDtoMapper::toDto)
                .map(comment -> ResponseEntity.status(HttpStatus.CREATED).body(comment))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<EventPostDTO> likeEventPost(final String id, final LikeEventPostRequestDTO dto) {
        return eventAdapter.likeEventPost(id, dto.getPostId())
                .map(post -> EventDtoMapper.toDto(post, eventAdapter.currentMemberId()))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<EventPhotoConsentDTO> giveEventPhotoConsent(final String id) {
        return eventAdapter.giveEventPhotoConsent(id)
                .map(EventDtoMapper::toDto)
                .map(consent -> ResponseEntity.status(HttpStatus.CREATED).body(consent))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static Instant toInstant(final LocalDateTime value) {
        return value == null ? null : value.toInstant(ZoneOffset.UTC);
    }
}
