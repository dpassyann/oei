package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import global.oei.domain.shared.institution.Institution;
import global.oei.domain.shared.institution.InstitutionDomain;
import global.oei.domain.shared.institution.InstitutionId;
import global.oei.domain.shared.institution.InstitutionPort;
import global.oei.domain.shared.institution.InstitutionWorkflowStatus;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import tools.jackson.databind.ObjectMapper;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstitutionPersistenceAdapter implements InstitutionPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final InstitutionRepository repository;
    private final InstitutionDomainRepository domainRepository;

    @Override
    public Optional<Institution> findById(final InstitutionId id) {
        return repository.findById(id.value()).map(entity -> toDomain(entity, domainRepository.findByInstitutionId(entity.getId())));
    }

    @Override
    public Optional<Institution> findByPublicSlug(final String publicSlug) {
        return repository.findByPublicSlug(publicSlug)
                .map(entity -> toDomain(entity, domainRepository.findByInstitutionId(entity.getId())));
    }

    @Override
    public List<Institution> findAll() {
        return repository.findAll().stream()
                .map(entity -> toDomain(entity, domainRepository.findByInstitutionId(entity.getId())))
                .toList();
    }

    @Override
    @Transactional
    public InstitutionDomain addDomain(final InstitutionId institutionId, final InstitutionDomain domain) {
        final InstitutionDomainEntity entity =
                new InstitutionDomainEntity(UUID.fromString(domain.id()), institutionId.value(), domain.domain(), domain.verified(), domain.verifiedAt());
        domainRepository.save(entity);
        return domain;
    }

    @Override
    @Transactional
    public Institution save(final Institution institution) {
        final InstitutionEntity entity = new InstitutionEntity(
                institution.id().value(),
                institution.legalName(),
                institution.publicName(),
                institution.logoUrl(),
                institution.country(),
                toJson(institution.sectors()),
                institution.description(),
                institution.publicSlug(),
                institution.isDemoData(),
                institution.status().name());
        repository.save(entity);
        return institution;
    }

    @SneakyThrows
    private static Institution toDomain(final InstitutionEntity entity, final List<InstitutionDomainEntity> domainEntities) {
        final List<String> sectors = entity.getSectorsJson() == null
                ? List.of()
                : OBJECT_MAPPER.readValue(entity.getSectorsJson(), OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, String.class));
        final List<InstitutionDomain> domains = domainEntities.stream()
                .map(d -> new InstitutionDomain(d.getId().toString(), d.getDomain(), d.isVerified(), d.getVerifiedAt()))
                .toList();
        return new Institution(
                new InstitutionId(entity.getId()),
                entity.getLegalName(),
                entity.getPublicName(),
                entity.getLogoUrl(),
                entity.getCountry(),
                sectors,
                entity.getDescription(),
                domains,
                entity.getPublicSlug(),
                entity.isDemoData(),
                InstitutionWorkflowStatus.valueOf(entity.getStatus()));
    }

    @SneakyThrows
    private static String toJson(final List<String> sectors) {
        return OBJECT_MAPPER.writeValueAsString(sectors);
    }
}
