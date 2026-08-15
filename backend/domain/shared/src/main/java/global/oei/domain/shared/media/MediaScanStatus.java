package global.oei.domain.shared.media;

/**
 * Antivirus scan outcome of an uploaded {@link MediaAsset}. See {@code UploadMediaAssetService}'s
 * Javadoc: no real scanning engine is wired in this iteration, every upload is marked
 * {@link #CLEAN} synchronously.
 */
public enum MediaScanStatus {
    PENDING,
    CLEAN,
    INFECTED
}
