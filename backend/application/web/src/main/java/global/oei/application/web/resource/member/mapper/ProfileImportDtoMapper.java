package global.oei.application.web.resource.member.mapper;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.ProfileImportDTO;
import global.oei.application.web.model.ProfileImportSourceDTO;
import global.oei.application.web.model.ProfileImportStatusDTO;
import global.oei.domain.shared.profileimport.ProfileImport;

@UtilityClass
public class ProfileImportDtoMapper {

    public ProfileImportDTO toDto(final ProfileImport profileImport) {
        final ProfileImportDTO dto = new ProfileImportDTO(
                profileImport.id(),
                profileImport.memberId().value().toString(),
                ProfileImportSourceDTO.valueOf(profileImport.source().name()),
                ProfileImportStatusDTO.valueOf(profileImport.status().name()));
        dto.setCreatedAt(LocalDateTime.ofInstant(profileImport.createdAt(), ZoneOffset.UTC));
        dto.setUpdatedAt(LocalDateTime.ofInstant(profileImport.updatedAt(), ZoneOffset.UTC));
        dto.setErrorCode(JsonNullable.of(profileImport.errorCode()));
        dto.setProcessingStepLabel(JsonNullable.of(profileImport.processingStepLabel()));
        return dto;
    }
}
