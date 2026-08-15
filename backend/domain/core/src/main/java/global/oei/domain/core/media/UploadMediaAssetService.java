package global.oei.domain.core.media;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.media.MediaAsset;
import global.oei.domain.shared.media.MediaAssetPort;
import global.oei.domain.shared.media.MediaScanStatus;
import global.oei.domain.shared.media.UploadMediaAssetUseCase;

/**
 * Mocked media upload: no real object storage backend (S3/blob storage) is wired in this
 * iteration, so the uploaded file's bytes are never actually stored anywhere — only the
 * {@link MediaAsset} metadata row is real and persisted, with a clearly-labelled placeholder
 * {@link MediaAsset#url()} (a {@code mock-media} host). No real antivirus scan is run either:
 * {@link MediaScanStatus#CLEAN} is assigned synchronously, same posture as
 * {@code RenderCvService} for CV PDF rendering.
 */
public class UploadMediaAssetService implements UploadMediaAssetUseCase {

    private final MediaAssetPort mediaAssetPort;

    public UploadMediaAssetService(final MediaAssetPort mediaAssetPort) {
        this.mediaAssetPort = Objects.requireNonNull(mediaAssetPort, "mediaAssetPort must not be null");
    }

    @Override
    public MediaAsset execute(final String filename, final String mimeType, final long sizeBytes, final String uploadedBy) {
        final String id = UUID.randomUUID().toString();
        final MediaAsset asset = new MediaAsset(
                id, filename, "https://mock-media.oei.local/" + id + "/" + filename, mimeType, sizeBytes, uploadedBy, Instant.now(),
                MediaScanStatus.CLEAN);
        return mediaAssetPort.save(asset);
    }
}
