package global.oei.infrastructure.persistence.event;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.event.EventLocation;
import global.oei.domain.shared.event.EventProposal;
import global.oei.domain.shared.event.EventProposalAiPrecheck;
import global.oei.domain.shared.event.EventProposalPort;
import global.oei.domain.shared.event.EventProposalStatus;
import global.oei.domain.shared.event.EventType;
import global.oei.domain.shared.member.MemberId;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventProposalPersistenceAdapter implements EventProposalPort {

    private final EventProposalRepository repository;

    @Override
    @Transactional
    public EventProposal save(final EventProposal proposal) {
        final EventProposalEntity entity = new EventProposalEntity(
                UUID.fromString(proposal.id()), proposal.authorId().value(), proposal.title(), proposal.description(),
                proposal.type().name(), proposal.startAt(), proposal.endAt(), proposal.timezone(),
                proposal.location() == null ? null : proposal.location().country(),
                proposal.location() == null ? null : proposal.location().city(),
                proposal.location() == null ? null : proposal.location().venue(),
                proposal.location() == null ? null : proposal.location().onlineUrl(), proposal.imageUrl(), proposal.status().name(),
                proposal.submittedAt(), proposal.aiPrecheck() == null ? null : proposal.aiPrecheck().passed(),
                proposal.aiPrecheck() == null ? null : proposal.aiPrecheck().summary(),
                proposal.aiPrecheck() == null ? null : proposal.aiPrecheck().checkedAt(), proposal.moderatorNote());
        repository.save(entity);
        return proposal;
    }

    @Override
    public Optional<EventProposal> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(EventProposalPersistenceAdapter::toDomain);
    }

    @Override
    public List<EventProposal> findByAuthorId(final MemberId authorId) {
        return repository.findByAuthorId(authorId.value()).stream().map(EventProposalPersistenceAdapter::toDomain).toList();
    }

    @Override
    public List<EventProposal> findByStatus(final EventProposalStatus status) {
        return repository.findByStatus(status.name()).stream().map(EventProposalPersistenceAdapter::toDomain).toList();
    }

    private static EventProposal toDomain(final EventProposalEntity entity) {
        final EventLocation location = entity.getCountry() == null
                ? null
                : new EventLocation(entity.getCountry(), entity.getCity(), entity.getVenue(), entity.getOnlineUrl());
        final EventProposalAiPrecheck aiPrecheck = entity.getAiPrecheckPassed() == null
                ? null
                : new EventProposalAiPrecheck(entity.getAiPrecheckPassed(), entity.getAiPrecheckSummary(), entity.getAiPrecheckCheckedAt());
        return new EventProposal(
                entity.getId().toString(), new MemberId(entity.getAuthorId()), entity.getTitle(), entity.getDescription(),
                EventType.valueOf(entity.getType()), entity.getStartAt(), entity.getEndAt(), entity.getTimezone(), location,
                entity.getImageUrl(), EventProposalStatus.valueOf(entity.getStatus()), entity.getSubmittedAt(), aiPrecheck,
                entity.getModeratorNote());
    }
}
