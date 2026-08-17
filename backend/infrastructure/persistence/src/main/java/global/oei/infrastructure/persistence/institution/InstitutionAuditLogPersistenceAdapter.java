package global.oei.infrastructure.persistence.institution;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import tools.jackson.databind.ObjectMapper;

import global.oei.domain.shared.institution.InstitutionAuditLog;
import global.oei.domain.shared.institution.InstitutionAuditLogPort;
import global.oei.domain.shared.institution.InstitutionId;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstitutionAuditLogPersistenceAdapter implements InstitutionAuditLogPort {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final InstitutionAuditLogRepository repository;

    @Override
    public List<InstitutionAuditLog> findByInstitutionId(final InstitutionId institutionId) {
        return repository.findByInstitutionIdOrderByOccurredAtDesc(institutionId.value()).stream()
                .map(InstitutionAuditLogPersistenceAdapter::toDomain)
                .toList();
    }

    @Override
    public List<InstitutionAuditLog> findAll() {
        return repository.findAllByOrderByOccurredAtDesc().stream().map(InstitutionAuditLogPersistenceAdapter::toDomain).toList();
    }

    @Override
    @Transactional
    public InstitutionAuditLog append(final InstitutionAuditLog entry) {
        final InstitutionAuditLogEntity entity = new InstitutionAuditLogEntity(
                UUID.fromString(entry.id()), entry.institutionId() == null ? null : UUID.fromString(entry.institutionId()),
                entry.actorId(), entry.action(), entry.targetType(), entry.targetId(), entry.occurredAt(), toJson(entry.metadata()));
        repository.save(entity);
        return entry;
    }

    @SneakyThrows
    private static InstitutionAuditLog toDomain(final InstitutionAuditLogEntity entity) {
        final Map<String, Object> metadata = entity.getMetadataJson() == null
                ? Map.of()
                : OBJECT_MAPPER.readValue(entity.getMetadataJson(), Map.class);
        return new InstitutionAuditLog(
                entity.getId().toString(), entity.getInstitutionId() == null ? null : entity.getInstitutionId().toString(),
                entity.getActorId(), entity.getAction(), entity.getTargetType(), entity.getTargetId(), entity.getOccurredAt(),
                metadata);
    }

    @SneakyThrows
    private static String toJson(final Map<String, Object> metadata) {
        return metadata == null || metadata.isEmpty() ? null : OBJECT_MAPPER.writeValueAsString(metadata);
    }
}
