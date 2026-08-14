package global.oei.application.web.resource.cv.mapper;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import global.oei.application.web.model.CvDTO;
import global.oei.application.web.model.CvSectionDTO;
import global.oei.application.web.model.CvSectionTypeDTO;
import global.oei.application.web.model.CvTemplateDTO;
import global.oei.application.web.model.CvTranslationDTO;
import global.oei.application.web.model.CvTranslationStatusDTO;
import global.oei.application.web.model.PdfGenerationJobDTO;
import global.oei.domain.shared.cv.Cv;
import global.oei.domain.shared.cv.CvSection;
import global.oei.domain.shared.cv.CvTemplate;
import global.oei.domain.shared.cv.CvTranslation;
import global.oei.domain.shared.cv.PdfGenerationJob;
import lombok.experimental.UtilityClass;
import org.openapitools.jackson.nullable.JsonNullable;

@UtilityClass
public class CvDtoMapper {

    public CvTemplateDTO toDto(final CvTemplate template) {
        final CvTemplateDTO dto = new CvTemplateDTO(template.id(), template.code(), template.name());
        dto.setPreviewUrl(template.previewUrl() == null ? null : URI.create(template.previewUrl()));
        return dto;
    }

    public CvDTO toDto(final Cv cv) {
        final CvDTO dto = new CvDTO(
                cv.templateId(),
                cv.sourceLanguage(),
                cv.id(),
                cv.memberId().value().toString(),
                CvDTO.StatusEnum.valueOf(cv.status().name()));
        dto.setSections(cv.sections().stream().map(CvDtoMapper::toDto).toList());
        return dto;
    }

    public CvSectionDTO toDto(final CvSection section) {
        final CvSectionDTO dto = new CvSectionDTO(
                CvSectionTypeDTO.valueOf(section.type().name()), section.order(), section.content());
        dto.setId(section.id());
        dto.setCvId(section.cvId());
        dto.setTranslations(section.translations().stream().map(CvDtoMapper::toDto).toList());
        return dto;
    }

    public CvTranslationDTO toDto(final CvTranslation translation) {
        final CvTranslationDTO dto =
                new CvTranslationDTO(translation.language(), CvTranslationStatusDTO.valueOf(translation.status().name()));
        dto.setId(translation.id());
        dto.setSectionId(translation.sectionId());
        dto.setContent(translation.content());
        dto.setTranslatedAt(translation.translatedAt() == null
                ? null
                : LocalDateTime.ofInstant(translation.translatedAt(), ZoneOffset.UTC));
        dto.setValidatedBy(JsonNullable.of(translation.validatedBy()));
        return dto;
    }

    public PdfGenerationJobDTO toDto(final PdfGenerationJob job) {
        final PdfGenerationJobDTO dto = new PdfGenerationJobDTO(
                job.id(),
                PdfGenerationJobDTO.TargetTypeEnum.valueOf(job.targetType().name()),
                job.targetId(),
                global.oei.application.web.model.PdfGenerationJobStatusDTO.valueOf(job.status().name()));
        dto.setResultUrl(JsonNullable.of(job.resultUrl() == null ? null : URI.create(job.resultUrl())));
        dto.setRequestedAt(
                job.requestedAt() == null ? null : LocalDateTime.ofInstant(job.requestedAt(), ZoneOffset.UTC));
        dto.setCompletedAt(JsonNullable.of(
                job.completedAt() == null ? null : LocalDateTime.ofInstant(job.completedAt(), ZoneOffset.UTC)));
        return dto;
    }
}
