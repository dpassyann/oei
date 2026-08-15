package global.oei.domain.shared.media;

import java.time.Instant;
import java.util.Objects;

/**
 * A media library entry (image, attachment, ...). See {@code UploadMediaAssetService}'s
 * Javadoc: this is a real, persisted record — only the actual file bytes/object storage
 * backend is mocked (no real S3/blob storage wired yet), never a silent no-op.
 */
public record MediaAsset(
        String id,
        String filename,
        String url,
        String mimeType,
        Long sizeBytes,
        String uploadedBy,
        Instant uploadedAt,
        MediaScanStatus scanStatus) {

    public MediaAsset {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(filename, "filename must not be null");
        Objects.requireNonNull(url, "url must not be null");
        Objects.requireNonNull(mimeType, "mimeType must not be null");
        Objects.requireNonNull(uploadedAt, "uploadedAt must not be null");
        Objects.requireNonNull(scanStatus, "scanStatus must not be null");
    }
}
