package global.oei.infrastructure.wiring.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for media asset storage (MinIO, S3, etc).
 */
@Configuration
@ConfigurationProperties(prefix = "oei.media.storage")
public class MediaStorageProperties {

    /**
     * Base URL for media asset storage.
     * Examples:
     * - http://minio:9000/oei-media/ (local MinIO)
     * - https://s3.amazonaws.com/oei-media-bucket/ (AWS S3)
     */
    private String baseUrl = "https://mock-media.oei.local/";

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(final String baseUrl) {
        this.baseUrl = baseUrl;
    }
}

