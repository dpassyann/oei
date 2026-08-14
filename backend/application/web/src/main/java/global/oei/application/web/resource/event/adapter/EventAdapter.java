package global.oei.application.web.resource.event.adapter;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import global.oei.domain.shared.event.Event;
import global.oei.domain.shared.event.EventComment;
import global.oei.domain.shared.event.EventLocation;
import global.oei.domain.shared.event.EventPhotoConsent;
import global.oei.domain.shared.event.EventPost;
import global.oei.domain.shared.event.EventProposal;
import global.oei.domain.shared.event.EventRegistration;
import global.oei.domain.shared.event.EventType;
import global.oei.domain.shared.member.MemberId;

public interface EventAdapter {

    List<Event> listPublicEvents();

    Optional<Event> getPublicEventBySlug(String slug);

    EventProposal submitEventProposal(
            String title, String description, EventType type, Instant startAt, Instant endAt, String timezone,
            EventLocation location, String imageUrl);

    List<EventProposal> listMyEventProposals();

    Optional<EventRegistration> registerToEvent(String eventId);

    Optional<EventRegistration> getMyEventRegistration(String eventId);

    boolean unregisterFromEvent(String eventId);

    List<EventPost> listEventFeedPosts(String eventId);

    Optional<EventPost> createEventPost(String eventId, String text, String photoUrl);

    Optional<EventComment> addEventComment(String eventId, String postId, String text);

    Optional<EventPost> likeEventPost(String eventId, String postId);

    Optional<EventPhotoConsent> giveEventPhotoConsent(String eventId);

    List<EventProposal> listEventModerationQueue();

    boolean approveEventProposal(String id);

    boolean hideEventComment(String id);

    /** The caller's own {@link MemberId}, used to compute the per-viewer {@code likedByMe} flag. */
    MemberId currentMemberId();
}
