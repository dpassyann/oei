package global.oei.infrastructure.persistence.certification;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.certification.CertificationGoalPort;
import global.oei.domain.shared.certification.MemberCertificationGoal;
import global.oei.domain.shared.certification.MemberCertificationGoalStatus;
import global.oei.domain.shared.member.MemberId;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CertificationGoalPersistenceAdapter implements CertificationGoalPort {

    private final MemberCertificationGoalRepository repository;

    @Override
    public List<MemberCertificationGoal> findByMemberId(final MemberId memberId) {
        return repository.findByMemberId(memberId.value()).stream()
                .map(CertificationGoalPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public MemberCertificationGoal upsert(final MemberCertificationGoal goal) {
        final UUID memberId = goal.memberId().value();
        final MemberCertificationGoalEntity entity = repository
                .findByMemberIdAndRecognizedCertificationId(memberId, goal.recognizedCertificationId())
                .map(existing -> new MemberCertificationGoalEntity(
                        existing.getId(), memberId, goal.recognizedCertificationId(), goal.status().name()))
                .orElseGet(() -> new MemberCertificationGoalEntity(
                        UUID.randomUUID(), memberId, goal.recognizedCertificationId(), goal.status().name()));
        final MemberCertificationGoalEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    private static MemberCertificationGoal toDomain(final MemberCertificationGoalEntity entity) {
        final Instant createdAt = entity.getCreatedAt() == null ? Instant.now() : entity.getCreatedAt();
        final Instant updatedAt = entity.getLastModifiedAt() == null ? createdAt : entity.getLastModifiedAt();
        return new MemberCertificationGoal(
                entity.getId().toString(),
                new MemberId(entity.getMemberId()),
                entity.getRecognizedCertificationId(),
                MemberCertificationGoalStatus.valueOf(entity.getStatus()),
                createdAt,
                updatedAt);
    }
}
