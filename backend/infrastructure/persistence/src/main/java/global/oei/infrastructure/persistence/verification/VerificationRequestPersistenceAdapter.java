package global.oei.infrastructure.persistence.verification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.member.MemberId;
import global.oei.domain.shared.verification.VerificationRequest;
import global.oei.domain.shared.verification.VerificationRequestPort;
import global.oei.domain.shared.verification.VerificationRequestStatus;
import global.oei.domain.shared.verification.VerificationType;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VerificationRequestPersistenceAdapter implements VerificationRequestPort {

    private final VerificationRequestRepository repository;

    @Override
    public List<VerificationRequest> findByMemberId(final MemberId memberId) {
        return repository.findByMemberId(memberId.value()).stream()
                .map(VerificationRequestPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public Optional<VerificationRequest> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(VerificationRequestPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public VerificationRequest save(final VerificationRequest request) {
        final VerificationRequestEntity entity = new VerificationRequestEntity(
                UUID.fromString(request.id()),
                request.memberId().value(),
                request.type().name(),
                request.referenceId(),
                request.status().name(),
                request.submittedAt(),
                request.reviewedAt(),
                request.reviewerId() == null ? null : UUID.fromString(request.reviewerId()));
        repository.save(entity);
        return request;
    }

    private static VerificationRequest toDomain(final VerificationRequestEntity entity) {
        return new VerificationRequest(
                entity.getId().toString(),
                new MemberId(entity.getMemberId()),
                VerificationType.valueOf(entity.getType()),
                entity.getReferenceId(),
                VerificationRequestStatus.valueOf(entity.getStatus()),
                entity.getSubmittedAt(),
                entity.getReviewedAt(),
                entity.getReviewerId() == null ? null : entity.getReviewerId().toString());
    }
}
