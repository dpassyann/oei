package global.oei.infrastructure.persistence.institution;

import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.Partnership;
import global.oei.domain.shared.institution.PartnershipLevel;
import global.oei.domain.shared.institution.PartnershipPort;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartnershipPersistenceAdapter implements PartnershipPort {

    private final PartnershipRepository repository;

    @Override
    public Optional<Partnership> findByInstitutionId(final InstitutionId institutionId) {
        return repository.findById(institutionId.value()).map(PartnershipPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public Partnership save(final Partnership partnership) {
        final PartnershipEntity entity = new PartnershipEntity(
                partnership.institutionId().value(), partnership.level().name(), partnership.verified(),
                partnership.startedAt(), partnership.endsAt(), partnership.agreementDocumentUrl());
        repository.save(entity);
        return partnership;
    }

    private static Partnership toDomain(final PartnershipEntity entity) {
        return new Partnership(
                new InstitutionId(entity.getInstitutionId()), PartnershipLevel.valueOf(entity.getLevel()), entity.isVerified(),
                entity.getStartedAt(), entity.getEndsAt(), entity.getAgreementDocumentUrl());
    }
}
