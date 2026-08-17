package global.oei.application.web.resource.certification.mapper;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.CertificationCatalogStatusDTO;
import global.oei.application.web.model.CertificationDTO;
import global.oei.application.web.model.CertificationLevelDTO;
import global.oei.application.web.model.CertificationOeiStatusDTO;
import global.oei.application.web.model.CertificationStatusDTO;
import global.oei.application.web.model.MemberCertificationGoalDTO;
import global.oei.application.web.model.MemberCertificationGoalStatusDTO;
import global.oei.application.web.model.PageMetadataDTO;
import global.oei.application.web.model.RecognizedCertificationDTO;
import global.oei.application.web.model.RecognizedCertificationPageDTO;
import global.oei.application.web.model.RecognizedCertificationUpsertDTO;
import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.CertificationCatalogStatus;
import global.oei.domain.shared.certification.CertificationLevel;
import global.oei.domain.shared.certification.CertificationOeiStatus;
import global.oei.domain.shared.certification.MemberCertificationGoal;
import global.oei.domain.shared.certification.RecognizedCertification;
import global.oei.domain.shared.certification.RecognizedCertificationPage;

@UtilityClass
public class CertificationDtoMapper {

    public CertificationDTO toDto(final Certification certification) {
        final CertificationDTO dto = new CertificationDTO(
                certification.name(),
                certification.issuingOrganization(),
                certification.id(),
                certification.memberId().value().toString(),
                CertificationStatusDTO.valueOf(certification.status().name()));
        dto.setRecognizedCertificationId(JsonNullable.of(certification.recognizedCertificationId()));
        dto.setIssuedAt(certification.issuedAt());
        dto.setExpiresAt(JsonNullable.of(certification.expiresAt()));
        dto.setProofDocumentUrl(
                certification.proofDocumentUrl() == null ? null : URI.create(certification.proofDocumentUrl()));
        dto.setValidatedBy(JsonNullable.of(certification.validatedBy()));
        dto.setValidatedAt(JsonNullable.of(
                certification.validatedAt() == null ? null : LocalDateTime.ofInstant(certification.validatedAt(), ZoneOffset.UTC)));
        return dto;
    }

    public MemberCertificationGoalDTO toDto(final MemberCertificationGoal goal) {
        return new MemberCertificationGoalDTO(
                goal.recognizedCertificationId(),
                MemberCertificationGoalStatusDTO.valueOf(goal.status().name()),
                goal.id(),
                goal.memberId().value().toString(),
                LocalDateTime.ofInstant(goal.createdAt(), ZoneOffset.UTC),
                LocalDateTime.ofInstant(goal.updatedAt(), ZoneOffset.UTC));
    }

    public RecognizedCertificationDTO toDto(final RecognizedCertification entry) {
        final RecognizedCertificationDTO dto = new RecognizedCertificationDTO(
                entry.id(), entry.name(), entry.issuingOrganization(), CertificationOeiStatusDTO.valueOf(entry.oeiStatus().name()),
                CertificationCatalogStatusDTO.valueOf(entry.catalogStatus().name()));
        dto.setCatalogReference(entry.catalogReference());
        dto.setAutoValidate(entry.autoValidate());
        dto.setDomain(entry.domain());
        dto.setLevel(entry.level() == null ? null : CertificationLevelDTO.valueOf(entry.level().name()));
        dto.setLanguage(entry.language());
        dto.setCompetencies(entry.competencies());
        dto.setValidityMonths(JsonNullable.of(entry.validityMonths()));
        dto.setAssociatedPathRoute(JsonNullable.of(entry.associatedPathRoute()));
        dto.setDescription(entry.description());
        return dto;
    }

    public RecognizedCertificationPageDTO toDto(final RecognizedCertificationPage page) {
        return new RecognizedCertificationPageDTO(
                page.items().stream().map(CertificationDtoMapper::toDto).toList(),
                new PageMetadataDTO(page.page(), page.pageSize(), Math.toIntExact(page.totalItems())));
    }

    /**
     * Builds a transient {@link RecognizedCertification} carrying every field an admin can
     * submit through {@link RecognizedCertificationUpsertDTO} ({@code id}/{@code
     * catalogStatus} are placeholders — the caller always applies this through {@code
     * RecognizedCertification#withDetails}, which preserves the real ones).
     */
    public RecognizedCertification fromUpsertDto(final RecognizedCertificationUpsertDTO dto) {
        return new RecognizedCertification(
                "",
                dto.getName(),
                dto.getIssuingOrganization(),
                dto.getCatalogReference(),
                Boolean.TRUE.equals(dto.getAutoValidate()),
                dto.getDomain(),
                dto.getLevel() == null ? null : CertificationLevel.valueOf(dto.getLevel().name()),
                dto.getLanguage(),
                CertificationOeiStatus.valueOf(dto.getOeiStatus().name()),
                dto.getCompetencies() == null ? List.of() : dto.getCompetencies(),
                dto.getValidityMonths() == null ? null : dto.getValidityMonths().orElse(null),
                dto.getAssociatedPathRoute() == null ? null : dto.getAssociatedPathRoute().orElse(null),
                dto.getDescription(),
                CertificationCatalogStatus.DRAFT);
    }
}
