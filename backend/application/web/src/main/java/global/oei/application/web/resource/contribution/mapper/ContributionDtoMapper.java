package global.oei.application.web.resource.contribution.mapper;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.ContentCommentDTO;
import global.oei.application.web.model.ContentContributionDTO;
import global.oei.domain.shared.content.ContentComment;
import global.oei.domain.shared.content.ContentContribution;

@UtilityClass
public class ContributionDtoMapper {

    public ContentContributionDTO toDto(final ContentContribution contribution) {
        return new ContentContributionDTO(
                contribution.contentId(),
                contribution.patch(),
                contribution.id(),
                contribution.authorMemberId().value().toString(),
                ContentContributionDTO.StatusEnum.valueOf(contribution.status().name()),
                LocalDateTime.ofInstant(contribution.createdAt(), ZoneOffset.UTC));
    }

    public ContentCommentDTO toDto(final ContentComment comment) {
        final ContentCommentDTO dto = new ContentCommentDTO(
                comment.id(), comment.authorId(), comment.body(), LocalDateTime.ofInstant(comment.createdAt(), ZoneOffset.UTC));
        dto.setContributionId(JsonNullable.of(comment.contributionId()));
        dto.setContentId(JsonNullable.of(comment.contentId()));
        return dto;
    }
}
