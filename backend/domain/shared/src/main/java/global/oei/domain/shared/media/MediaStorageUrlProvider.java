package global.oei.domain.shared.media;

/**
 * Outbound port: provides the base URL for media storage (e.g. MinIO, S3, etc.).
 */
public interface MediaStorageUrlProvider {

    /**
     * @return the base URL for media asset storage
     */
    String getMediaStorageBaseUrl();
}

