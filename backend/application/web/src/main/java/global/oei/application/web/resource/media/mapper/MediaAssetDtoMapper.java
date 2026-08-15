package global.oei.application.web.resource.media.mapper;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import global.oei.application.web.model.MediaAssetDTO;
import global.oei.domain.shared.media.MediaAsset;
import lombok.experimental.UtilityClass;

@UtilityClass
public class MediaAssetDtoMapper {

    public MediaAssetDTO toDto(final MediaAsset asset) {
        final MediaAssetDTO dto = new MediaAssetDTO(asset.id(), asset.filename(), URI.create(asset.url()), asset.mimeType());
        dto.setSizeBytes(asset.sizeBytes() == null ? null : asset.sizeBytes().intValue());
        dto.setUploadedBy(asset.uploadedBy());
        dto.setUploadedAt(LocalDateTime.ofInstant(asset.uploadedAt(), ZoneOffset.UTC));
        dto.setScanStatus(MediaAssetDTO.ScanStatusEnum.valueOf(asset.scanStatus().name()));
        return dto;
    }
}
