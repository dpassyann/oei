package global.oei.infrastructure.persistence.certification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import tools.jackson.databind.ObjectMapper;

import global.oei.domain.shared.certification.CertificationCatalogStatus;
import global.oei.domain.shared.certification.CertificationLevel;
import global.oei.domain.shared.certification.CertificationOeiStatus;
import global.oei.domain.shared.certification.RecognizedCertification;
import global.oei.domain.shared.certification.RecognizedCertificationPage;
import global.oei.domain.shared.certification.RecognizedCertificationPort;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecognizedCertificationPersistenceAdapter implements RecognizedCertificationPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final RecognizedCertificationRepository repository;

    @Override
    public Optional<RecognizedCertification> findById(final String id) {
        return repository.findById(UUID.fromString(id)).map(RecognizedCertificationPersistenceAdapter::toDomain);
    }

    @Override
    public RecognizedCertificationPage findCatalog(final int page, final int pageSize) {
        final Page<RecognizedCertificationEntity> result = repository.findAll(PageRequest.of(page, pageSize));
        return new RecognizedCertificationPage(
                result.getContent().stream().map(RecognizedCertificationPersistenceAdapter::toDomain).toList(), page, pageSize,
                result.getTotalElements());
    }

    @Override
    @Transactional
    public RecognizedCertification save(final RecognizedCertification recognizedCertification) {
        final RecognizedCertificationEntity entity = new RecognizedCertificationEntity(
                UUID.fromString(recognizedCertification.id()),
                recognizedCertification.name(),
                recognizedCertification.issuingOrganization(),
                recognizedCertification.catalogReference(),
                recognizedCertification.autoValidate(),
                recognizedCertification.domain(),
                recognizedCertification.level() == null ? null : recognizedCertification.level().name(),
                recognizedCertification.language(),
                recognizedCertification.oeiStatus().name(),
                toJson(recognizedCertification.competencies()),
                recognizedCertification.validityMonths(),
                recognizedCertification.associatedPathRoute(),
                recognizedCertification.description(),
                recognizedCertification.catalogStatus().name());
        repository.save(entity);
        return recognizedCertification;
    }

    @SneakyThrows
    private static RecognizedCertification toDomain(final RecognizedCertificationEntity entity) {
        final List<String> competencies = entity.getCompetenciesJson() == null
                ? List.of()
                : OBJECT_MAPPER.readValue(
                        entity.getCompetenciesJson(), OBJECT_MAPPER.getTypeFactory().constructCollectionType(List.class, String.class));
        return new RecognizedCertification(
                entity.getId().toString(),
                entity.getName(),
                entity.getIssuingOrganization(),
                entity.getCatalogReference(),
                entity.isAutoValidate(),
                entity.getDomain(),
                entity.getLevel() == null ? null : CertificationLevel.valueOf(entity.getLevel()),
                entity.getLanguage(),
                CertificationOeiStatus.valueOf(entity.getOeiStatus()),
                competencies,
                entity.getValidityMonths(),
                entity.getAssociatedPathRoute(),
                entity.getDescription(),
                CertificationCatalogStatus.valueOf(entity.getCatalogStatus()));
    }

    @SneakyThrows
    private static String toJson(final List<String> competencies) {
        return OBJECT_MAPPER.writeValueAsString(competencies);
    }
}
