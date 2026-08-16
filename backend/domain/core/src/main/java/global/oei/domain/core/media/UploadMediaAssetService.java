package global.oei.domain.core.media;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import global.oei.domain.shared.media.MediaAsset;
import global.oei.domain.shared.media.MediaAssetPort;
import global.oei.domain.shared.media.MediaScanStatus;
import global.oei.domain.shared.media.MediaStorageUrlProvider;
import global.oei.domain.shared.media.UploadMediaAssetUseCase;

/**
 * Mocked media upload: no real object storage backend (S3/blob storage) is wired in this
 * iteration, so the uploaded file's bytes are never actually stored anywhere — only the
 * {@link MediaAsset} metadata row is real and persisted, with a URL provided by the
 * injected {@link MediaStorageUrlProvider} (e.g. MinIO locally, S3 in production).
 * No real antivirus scan is run either: {@link MediaScanStatus#CLEAN} is assigned
 * synchronously, same posture as {@code RenderCvService} for CV PDF rendering.
 */
public class UploadMediaAssetService implements UploadMediaAssetUseCase {

    private final MediaAssetPort mediaAssetPort;
    private final MediaStorageUrlProvider storageUrlProvider;

    public UploadMediaAssetService(final MediaAssetPort mediaAssetPort,
                                   final MediaStorageUrlProvider storageUrlProvider) {
        this.mediaAssetPort = Objects.requireNonNull(mediaAssetPort, "mediaAssetPort must not be null");
        this.storageUrlProvider = Objects.requireNonNull(storageUrlProvider, "storageUrlProvider must not be null");
    }

    @Override
    public MediaAsset execute(final String filename, final String mimeType, final long sizeBytes, final String uploadedBy) {
        final String id = UUID.randomUUID().toString();
        final String baseUrl = storageUrlProvider.getMediaStorageBaseUrl();
        final String assetUrl = baseUrl + id + "/" + filename;
        final MediaAsset asset = new MediaAsset(
                id, filename, assetUrl, mimeType, sizeBytes, uploadedBy, Instant.now(),
                MediaScanStatus.CLEAN);
        return mediaAssetPort.save(asset);
    }
}
