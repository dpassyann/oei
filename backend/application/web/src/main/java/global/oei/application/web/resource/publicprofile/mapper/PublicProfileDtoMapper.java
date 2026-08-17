package global.oei.application.web.resource.publicprofile.mapper;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.experimental.UtilityClass;

import global.oei.application.web.model.DigitalBusinessCardDTO;
import global.oei.application.web.model.MembershipTierDTO;
import global.oei.application.web.model.PublicProfileDTO;
import global.oei.domain.shared.publicprofile.DigitalBusinessCard;
import global.oei.domain.shared.publicprofile.PublicProfile;

@UtilityClass
public class PublicProfileDtoMapper {

    public PublicProfileDTO toDto(final PublicProfile profile) {
        final PublicProfileDTO dto = new PublicProfileDTO(profile.memberId().value().toString(), profile.publicSlug());
        dto.setVisibleFields(profile.visibleFields());
        dto.setSeoDescription(profile.seoDescription());
        dto.setPublishedAt(JsonNullable.of(
                profile.publishedAt() == null ? null : LocalDateTime.ofInstant(profile.publishedAt(), ZoneOffset.UTC)));
        dto.setViewsCount(profile.viewsCount());
        return dto;
    }

    public DigitalBusinessCardDTO toDto(final DigitalBusinessCard card) {
        final DigitalBusinessCardDTO dto = new DigitalBusinessCardDTO(card.memberId().value().toString(), card.publicSlug());
        dto.setQrCodeUrl(URI.create(card.qrCodeUrl()));
        dto.setvCardUrl(URI.create(card.vCardUrl()));
        dto.setTheme(card.theme());
        dto.setTier(card.tier() == null ? null : MembershipTierDTO.valueOf(card.tier().name()));
        return dto;
    }
}
