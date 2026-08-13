package global.oei.application.web.resource.badge.mapper;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import global.oei.application.web.model.BadgeAwardDTO;
import global.oei.application.web.model.BadgeDTO;
import global.oei.domain.shared.badge.Badge;
import global.oei.domain.shared.badge.BadgeAward;
import lombok.experimental.UtilityClass;
import org.openapitools.jackson.nullable.JsonNullable;

@UtilityClass
public class BadgeDtoMapper {

    public BadgeDTO toDto(final Badge badge) {
        final BadgeDTO dto = new BadgeDTO(badge.id(), badge.code(), badge.name(), BadgeDTO.CategoryEnum.valueOf(badge.category().name()));
        dto.setDescription(badge.description());
        dto.setIconUrl(badge.iconUrl() == null ? null : URI.create(badge.iconUrl()));
        return dto;
    }

    public BadgeAwardDTO toDto(final BadgeAward award) {
        final BadgeAwardDTO dto = new BadgeAwardDTO(
                award.id(),
                award.badgeId(),
                award.memberId().value().toString(),
                LocalDateTime.ofInstant(award.awardedAt(), ZoneOffset.UTC),
                BadgeAwardDTO.SourceEnum.valueOf(award.source().name()));
        dto.setAwardedBy(JsonNullable.of(award.awardedBy()));
        dto.setRevoked(award.revoked());
        return dto;
    }
}
