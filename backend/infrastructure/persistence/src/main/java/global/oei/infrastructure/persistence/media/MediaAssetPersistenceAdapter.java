package global.oei.infrastructure.persistence.media;

import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import global.oei.domain.shared.media.MediaAsset;
import global.oei.domain.shared.media.MediaAssetPort;
import global.oei.domain.shared.media.MediaScanStatus;

@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MediaAssetPersistenceAdapter implements MediaAssetPort {

    private final MediaAssetRepository repository;

    @Override
    @Transactional
    public MediaAsset save(final MediaAsset asset) {
        repository.save(new MediaAssetEntity(
                UUID.fromString(asset.id()), asset.filename(), asset.url(), asset.mimeType(), asset.sizeBytes(), asset.uploadedBy(),
                asset.uploadedAt(), asset.scanStatus().name()));
        return asset;
    }

    @Override
    public List<MediaAsset> findAll() {
        return repository.findAll().stream().map(MediaAssetPersistenceAdapter::toDomain).toList();
    }

    private static MediaAsset toDomain(final MediaAssetEntity entity) {
        return new MediaAsset(
                entity.getId().toString(), entity.getFilename(), entity.getUrl(), entity.getMimeType(), entity.getSizeBytes(),
                entity.getUploadedBy(), entity.getUploadedAt(), MediaScanStatus.valueOf(entity.getScanStatus()));
    }
}
