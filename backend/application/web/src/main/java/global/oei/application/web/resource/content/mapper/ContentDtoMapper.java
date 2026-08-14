package global.oei.application.web.resource.content.mapper;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import global.oei.application.web.model.ContentApprovalDTO;
import global.oei.application.web.model.ContentContributionDTO;
import global.oei.application.web.model.ContentDTO;
import global.oei.application.web.model.ContentGovernanceDTO;
import global.oei.application.web.model.ContentPublicationDTO;
import global.oei.application.web.model.ContentSourceTypeDTO;
import global.oei.application.web.model.ContentTranslationDTO;
import global.oei.application.web.model.ContentTranslationStatusDTO;
import global.oei.application.web.model.ContentTypeDTO;
import global.oei.application.web.model.ContentVersionDTO;
import global.oei.application.web.model.ContentWorkflowStatusDTO;
import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentApproval;
import global.oei.domain.shared.content.ContentContribution;
import global.oei.domain.shared.content.ContentPublication;
import global.oei.domain.shared.content.ContentTranslation;
import global.oei.domain.shared.content.ContentVersion;
import lombok.experimental.UtilityClass;
import org.openapitools.jackson.nullable.JsonNullable;

@UtilityClass
public class ContentDtoMapper {

    public ContentDTO toDto(final Content content) {
        final ContentDTO dto = new ContentDTO(
                ContentTypeDTO.valueOf(content.type().name()), content.slug(), ContentSourceTypeDTO.valueOf(content.sourceType().name()),
                content.title(), content.id(), ContentWorkflowStatusDTO.valueOf(content.status().name()));
        dto.setTags(content.tags());
        if (content.governance() != null) {
            final ContentGovernanceDTO governanceDto = new ContentGovernanceDTO();
            governanceDto.setApprovalRequired(content.governance().approvalRequired());
            governanceDto.setDecisionId(JsonNullable.of(content.governance().decisionId()));
            dto.setGovernance(governanceDto);
        }
        dto.setCurrentVersionId(JsonNullable.of(content.currentVersionId()));
        return dto;
    }

    public ContentVersionDTO toDto(final ContentVersion version) {
        final ContentVersionDTO dto = new ContentVersionDTO(
                version.language(), version.title(), version.body(), version.id(), version.contentId(), version.version(),
                ContentWorkflowStatusDTO.valueOf(version.status().name()));
        dto.setFrontMatter(version.frontMatter());
        dto.setAuthorIds(version.authorIds());
        dto.setCreatedAt(version.createdAt() == null ? null : LocalDateTime.ofInstant(version.createdAt(), ZoneOffset.UTC));
        return dto;
    }

    public ContentApprovalDTO toDto(final ContentApproval approval) {
        final ContentApprovalDTO dto = new ContentApprovalDTO(
                ContentApprovalDTO.RoleEnum.valueOf(approval.role().name()), ContentApprovalDTO.DecisionEnum.valueOf(approval.decision().name()),
                approval.id(), approval.contentVersionId(), approval.approverId(), LocalDateTime.ofInstant(approval.decidedAt(), ZoneOffset.UTC));
        dto.setComment(approval.comment());
        return dto;
    }

    public ContentTranslationDTO toDto(final ContentTranslation translation) {
        final ContentTranslationDTO dto =
                new ContentTranslationDTO(translation.language(), ContentTranslationStatusDTO.valueOf(translation.status().name()));
        dto.setId(translation.id());
        dto.setContentVersionId(translation.contentVersionId());
        dto.setTranslatorId(JsonNullable.of(translation.translatorId()));
        dto.setValidatedBy(JsonNullable.of(translation.validatedBy()));
        dto.setValidatedAt(JsonNullable.of(
                translation.validatedAt() == null ? null : LocalDateTime.ofInstant(translation.validatedAt(), ZoneOffset.UTC)));
        return dto;
    }

    public ContentContributionDTO toDto(final ContentContribution contribution) {
        return new ContentContributionDTO(
                contribution.contentId(), contribution.patch(), contribution.id(), contribution.authorMemberId().toString(),
                ContentContributionDTO.StatusEnum.valueOf(contribution.status().name()),
                LocalDateTime.ofInstant(contribution.createdAt(), ZoneOffset.UTC));
    }

    public ContentPublicationDTO toDto(final ContentPublication publication) {
        final ContentPublicationDTO dto =
                new ContentPublicationDTO(publication.id(), publication.contentVersionId(), LocalDateTime.ofInstant(publication.publishedAt(), ZoneOffset.UTC));
        dto.setPublishedBy(publication.publishedBy());
        dto.setChannel(publication.channel());
        return dto;
    }
}
