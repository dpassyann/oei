package global.oei.infrastructure.persistence.certification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationPort;
import global.oei.domain.shared.certification.CertificationStatus;
import global.oei.domain.shared.member.MemberId;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CertificationPersistenceAdapter implements CertificationPort {

    private final CertificationRepository repository;

    @Override
    public List<Certification> findByMemberId(final MemberId memberId) {
        return repository.findByMemberId(memberId.value()).stream()
                .map(CertificationPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public Optional<Certification> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(CertificationPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public Certification save(final Certification certification) {
        final CertificationEntity entity = new CertificationEntity(
                UUID.fromString(certification.id()),
                certification.memberId().value(),
                certification.name(),
                certification.issuingOrganization(),
                certification.recognizedCertificationId(),
                certification.issuedAt(),
                certification.expiresAt(),
                certification.proofDocumentUrl(),
                certification.status().name(),
                certification.validatedBy(),
                certification.validatedAt());
        repository.save(entity);
        return certification;
    }

    private static Certification toDomain(final CertificationEntity entity) {
        return new Certification(
                entity.getId().toString(),
                new MemberId(entity.getMemberId()),
                entity.getName(),
                entity.getIssuingOrganization(),
                entity.getRecognizedCertificationId(),
                entity.getIssuedAt(),
                entity.getExpiresAt(),
                entity.getProofDocumentUrl(),
                CertificationStatus.valueOf(entity.getStatus()),
                entity.getValidatedBy(),
                entity.getValidatedAt());
    }
}
