package global.oei.application.web.resource.event.mapper;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import global.oei.application.web.model.EventCommentDTO;
import global.oei.application.web.model.EventCommentStatusDTO;
import global.oei.application.web.model.EventDTO;
import global.oei.application.web.model.EventLocationDTO;
import global.oei.application.web.model.EventPhotoConsentDTO;
import global.oei.application.web.model.EventPostDTO;
import global.oei.application.web.model.EventProposalAiPrecheckDTO;
import global.oei.application.web.model.EventProposalDTO;
import global.oei.application.web.model.EventProposalStatusDTO;
import global.oei.application.web.model.EventRegistrationDTO;
import global.oei.application.web.model.EventSpeakerDTO;
import global.oei.application.web.model.EventStatusDTO;
import global.oei.application.web.model.EventTypeDTO;
import global.oei.domain.shared.event.Event;
import global.oei.domain.shared.event.EventComment;
import global.oei.domain.shared.event.EventLocation;
import global.oei.domain.shared.event.EventPhotoConsent;
import global.oei.domain.shared.event.EventPost;
import global.oei.domain.shared.event.EventProposal;
import global.oei.domain.shared.event.EventRegistration;
import global.oei.domain.shared.event.EventSpeaker;
import global.oei.domain.shared.member.MemberId;
import lombok.experimental.UtilityClass;
import org.openapitools.jackson.nullable.JsonNullable;

@UtilityClass
public class EventDtoMapper {

    public EventDTO toDto(final Event event) {
        final EventDTO dto = new EventDTO(
                event.id(), event.slug(), event.title(), EventTypeDTO.valueOf(event.type().name()), event.description(),
                toDto(event.location()), LocalDateTime.ofInstant(event.startAt(), ZoneOffset.UTC),
                LocalDateTime.ofInstant(event.endAt(), ZoneOffset.UTC), event.timezone(),
                EventDTO.VisibilityEnum.valueOf(event.visibility().name()), EventStatusDTO.valueOf(event.status().name()));
        dto.setImageUrl(event.imageUrl() == null ? null : URI.create(event.imageUrl()));
        dto.setCapacity(event.capacity());
        dto.setRegistrationsCount(event.registrationsCount());
        dto.setOrganizers(event.organizers());
        dto.setLanguages(event.languages());
        dto.setSpeakers(event.speakers().stream().map(EventDtoMapper::toDto).toList());
        dto.setCommentsOpenAt(JsonNullable.of(
                event.commentsOpenAt() == null ? null : LocalDateTime.ofInstant(event.commentsOpenAt(), ZoneOffset.UTC)));
        dto.setCommentsClosedAt(JsonNullable.of(
                event.commentsClosedAt() == null ? null : LocalDateTime.ofInstant(event.commentsClosedAt(), ZoneOffset.UTC)));
        dto.setSummary(JsonNullable.of(event.summary()));
        dto.setGalleryImageUrls(event.galleryImageUrls().stream().map(URI::create).toList());
        return dto;
    }

    public EventLocationDTO toDto(final EventLocation location) {
        final EventLocationDTO dto = new EventLocationDTO(location.country());
        dto.setCity(location.city());
        dto.setVenue(location.venue());
        dto.setOnlineUrl(location.onlineUrl() == null ? null : URI.create(location.onlineUrl()));
        return dto;
    }

    public EventSpeakerDTO toDto(final EventSpeaker speaker) {
        final EventSpeakerDTO dto = new EventSpeakerDTO(speaker.name());
        dto.setRole(speaker.role());
        return dto;
    }

    public EventRegistrationDTO toDto(final EventRegistration registration) {
        return new EventRegistrationDTO(
                registration.id(), registration.eventId(), registration.memberId().toString(), EventRegistrationDTO.StatusEnum.GOING,
                LocalDateTime.ofInstant(registration.registeredAt(), ZoneOffset.UTC));
    }

    public EventPostDTO toDto(final EventPost post, final MemberId viewer) {
        final EventPostDTO dto = new EventPostDTO(
                post.text(), post.id(), post.eventId(), post.authorId().toString(), post.authorName(),
                LocalDateTime.ofInstant(post.createdAt(), ZoneOffset.UTC), post.likedByMemberIds().size(),
                viewer != null && post.likedByMemberIds().contains(viewer));
        dto.setPhotoUrl(post.photoUrl() == null ? null : URI.create(post.photoUrl()));
        return dto;
    }

    public EventCommentDTO toDto(final EventComment comment) {
        return new EventCommentDTO(
                comment.postId(), comment.text(), comment.id(), comment.eventId(), comment.authorId().toString(), comment.authorName(),
                LocalDateTime.ofInstant(comment.createdAt(), ZoneOffset.UTC), EventCommentStatusDTO.valueOf(comment.status().name()));
    }

    public EventPhotoConsentDTO toDto(final EventPhotoConsent consent) {
        return new EventPhotoConsentDTO(
                consent.eventId(), consent.memberId().toString(), LocalDateTime.ofInstant(consent.consentedAt(), ZoneOffset.UTC));
    }

    public EventProposalDTO toDto(final EventProposal proposal) {
        final EventLocation location = proposal.location();
        final EventProposalDTO dto = new EventProposalDTO(
                proposal.title(), proposal.description(), EventTypeDTO.valueOf(proposal.type().name()),
                proposal.startAt() == null ? null : LocalDateTime.ofInstant(proposal.startAt(), ZoneOffset.UTC),
                proposal.endAt() == null ? null : LocalDateTime.ofInstant(proposal.endAt(), ZoneOffset.UTC), proposal.timezone(),
                location == null ? null : location.country(), proposal.id(), proposal.authorId().toString(),
                EventProposalStatusDTO.valueOf(proposal.status().name()));
        dto.setCity(location == null ? null : location.city());
        dto.setVenue(location == null ? null : location.venue());
        dto.setOnlineUrl(location == null || location.onlineUrl() == null ? null : URI.create(location.onlineUrl()));
        dto.setImageUrl(proposal.imageUrl() == null ? null : URI.create(proposal.imageUrl()));
        dto.setSubmittedAt(JsonNullable.of(
                proposal.submittedAt() == null ? null : LocalDateTime.ofInstant(proposal.submittedAt(), ZoneOffset.UTC)));
        if (proposal.aiPrecheck() != null) {
            final EventProposalAiPrecheckDTO precheckDto = new EventProposalAiPrecheckDTO(
                    proposal.aiPrecheck().passed(), proposal.aiPrecheck().summary(),
                    LocalDateTime.ofInstant(proposal.aiPrecheck().checkedAt(), ZoneOffset.UTC));
            dto.setAiPrecheck(precheckDto);
        }
        dto.setModeratorNote(JsonNullable.of(proposal.moderatorNote()));
        return dto;
    }
}
