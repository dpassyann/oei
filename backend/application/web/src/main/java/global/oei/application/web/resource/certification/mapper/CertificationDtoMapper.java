package global.oei.application.web.resource.certification.mapper;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import global.oei.application.web.model.CertificationDTO;
import global.oei.application.web.model.CertificationStatusDTO;
import global.oei.application.web.model.MemberCertificationGoalDTO;
import global.oei.application.web.model.MemberCertificationGoalStatusDTO;
import global.oei.domain.shared.certification.Certification;
import global.oei.domain.shared.certification.MemberCertificationGoal;
import lombok.experimental.UtilityClass;
import org.openapitools.jackson.nullable.JsonNullable;

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
}
