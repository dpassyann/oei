package global.oei.application.web.resource.verification.mapper;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.VerificationRequestDTO;
import global.oei.domain.shared.verification.VerificationRequest;

@UtilityClass
public class VerificationRequestDtoMapper {

    public VerificationRequestDTO toDto(final VerificationRequest request) {
        final VerificationRequestDTO dto = new VerificationRequestDTO(
                VerificationRequestDTO.TypeEnum.valueOf(request.type().name()),
                request.id(),
                request.memberId().value().toString(),
                VerificationRequestDTO.StatusEnum.valueOf(request.status().name()),
                LocalDateTime.ofInstant(request.submittedAt(), ZoneOffset.UTC));
        dto.setReferenceId(request.referenceId());
        dto.setReviewedAt(JsonNullable.of(
                request.reviewedAt() == null ? null : LocalDateTime.ofInstant(request.reviewedAt(), ZoneOffset.UTC)));
        dto.setReviewerId(JsonNullable.of(request.reviewerId()));
        return dto;
    }
}
