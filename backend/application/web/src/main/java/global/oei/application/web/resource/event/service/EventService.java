package global.oei.application.web.resource.event.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.application.web.resource.event.adapter.EventAdapter;
import global.oei.domain.shared.event.Event;
import global.oei.domain.shared.event.EventComment;
import global.oei.domain.shared.event.EventCommentPort;
import global.oei.domain.shared.event.EventCommentStatus;
import global.oei.domain.shared.event.EventLocation;
import global.oei.domain.shared.event.EventPhotoConsent;
import global.oei.domain.shared.event.EventPhotoConsentPort;
import global.oei.domain.shared.event.EventPort;
import global.oei.domain.shared.event.EventPost;
import global.oei.domain.shared.event.EventPostPort;
import global.oei.domain.shared.event.EventProposal;
import global.oei.domain.shared.event.EventProposalPort;
import global.oei.domain.shared.event.EventProposalStatus;
import global.oei.domain.shared.event.EventRegistration;
import global.oei.domain.shared.event.EventRegistrationPort;
import global.oei.domain.shared.event.EventType;
import global.oei.domain.shared.event.RegisterToEventUseCase;
import global.oei.domain.shared.event.SubmitEventProposalUseCase;
import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventService implements EventAdapter {

    private final SecurityContextPort securityContextPort;
    private final EventPort eventPort;
    private final EventProposalPort eventProposalPort;
    private final SubmitEventProposalUseCase submitEventProposalUseCase;
    private final EventRegistrationPort eventRegistrationPort;
    private final RegisterToEventUseCase registerToEventUseCase;
    private final EventPostPort eventPostPort;
    private final EventCommentPort eventCommentPort;
    private final EventPhotoConsentPort eventPhotoConsentPort;

    @Override
    public List<Event> listPublicEvents() {
        return eventPort.findPublished();
    }

    @Override
    public Optional<Event> getPublicEventBySlug(final String slug) {
        return eventPort.findBySlug(slug);
    }

    @Override
    public EventProposal submitEventProposal(
            final String title, final String description, final EventType type, final Instant startAt, final Instant endAt,
            final String timezone, final EventLocation location, final String imageUrl) {
        return submitEventProposalUseCase.execute(currentMemberId(), title, description, type, startAt, endAt, timezone, location, imageUrl);
    }

    @Override
    public List<EventProposal> listMyEventProposals() {
        return eventProposalPort.findByAuthorId(currentMemberId());
    }

    @Override
    public Optional<EventRegistration> registerToEvent(final String eventId) {
        if (eventPort.findById(eventId).isEmpty()) {
            return Optional.empty();
        }
        final EventRegistration registration = registerToEventUseCase.execute(eventId, currentMemberId());
        refreshRegistrationsCount(eventId);
        return Optional.of(registration);
    }

    @Override
    public Optional<EventRegistration> getMyEventRegistration(final String eventId) {
        return eventRegistrationPort.findByEventIdAndMemberId(eventId, currentMemberId());
    }

    @Override
    public boolean unregisterFromEvent(final String eventId) {
        final MemberId memberId = currentMemberId();
        final boolean existed = eventRegistrationPort.findByEventIdAndMemberId(eventId, memberId).isPresent();
        eventRegistrationPort.delete(eventId, memberId);
        if (existed) {
            refreshRegistrationsCount(eventId);
        }
        return existed;
    }

    @Override
    public List<EventPost> listEventFeedPosts(final String eventId) {
        return eventPostPort.findByEventId(eventId);
    }

    @Override
    public Optional<EventPost> createEventPost(final String eventId, final String text, final String photoUrl) {
        if (eventPort.findById(eventId).isEmpty()) {
            return Optional.empty();
        }
        final MemberId authorId = currentMemberId();
        final EventPost post = new EventPost(
                UUID.randomUUID().toString(), eventId, authorId, currentDisplayName(), text, photoUrl, Instant.now(), List.of());
        return Optional.of(eventPostPort.save(post));
    }

    @Override
    public Optional<EventComment> addEventComment(final String eventId, final String postId, final String text) {
        final Event event = eventPort.findById(eventId).orElse(null);
        if (event == null) {
            return Optional.empty();
        }
        if (!event.isWithinCommentsWindow(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "comments are closed for this event");
        }
        final MemberId authorId = currentMemberId();
        final EventComment comment = new EventComment(
                UUID.randomUUID().toString(), eventId, postId, authorId, currentDisplayName(), text, Instant.now(),
                EventCommentStatus.VISIBLE);
        return Optional.of(eventCommentPort.save(comment));
    }

    @Override
    public Optional<EventPost> likeEventPost(final String eventId, final String postId) {
        return eventPostPort.findById(postId)
                .filter(post -> post.eventId().equals(eventId))
                .map(post -> eventPostPort.save(post.like(currentMemberId())));
    }

    @Override
    public Optional<EventPhotoConsent> giveEventPhotoConsent(final String eventId) {
        if (eventPort.findById(eventId).isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(eventPhotoConsentPort.save(new EventPhotoConsent(eventId, currentMemberId(), Instant.now())));
    }

    @Override
    public List<EventProposal> listEventModerationQueue() {
        return eventProposalPort.findByStatus(EventProposalStatus.MODERATOR_REVIEW);
    }

    @Override
    public boolean approveEventProposal(final String id) {
        return eventProposalPort.findById(id).map(proposal -> {
            eventProposalPort.save(proposal.approve());
            return true;
        }).orElse(false);
    }

    @Override
    public boolean hideEventComment(final String id) {
        return eventCommentPort.findById(id).map(comment -> {
            eventCommentPort.save(comment.hide());
            return true;
        }).orElse(false);
    }

    /** Currently persisted at save-time via {@link EventPort}; refreshed after each (un)registration. */
    private void refreshRegistrationsCount(final String eventId) {
        eventPort.findById(eventId).ifPresent(event -> eventPort.save(event.withRegistrationsCount(eventRegistrationPort.countByEventId(eventId))));
    }

    private String currentDisplayName() {
        return currentIdentity().displayName();
    }

    @Override
    public MemberId currentMemberId() {
        return MemberId.of(currentIdentity().subject());
    }

    private AuthenticatedIdentity currentIdentity() {
        return securityContextPort.currentIdentity().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
