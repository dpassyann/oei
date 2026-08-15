package global.oei.domain.shared.media;

/**
 * Inbound port: register an uploaded media file. See {@link MediaAsset}'s Javadoc for what is
 * mocked in this iteration.
 */
public interface UploadMediaAssetUseCase {

    MediaAsset execute(String filename, String mimeType, long sizeBytes, String uploadedBy);
}
