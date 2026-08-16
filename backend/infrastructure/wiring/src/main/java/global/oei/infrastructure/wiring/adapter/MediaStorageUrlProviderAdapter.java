package global.oei.infrastructure.wiring.adapter;

import java.util.Objects;

import global.oei.domain.shared.media.MediaStorageUrlProvider;
import global.oei.infrastructure.wiring.config.MediaStorageProperties;

/**
 * Secondary adapter: provides media storage base URL from configuration.
 */
public class MediaStorageUrlProviderAdapter implements MediaStorageUrlProvider {

    private final MediaStorageProperties properties;

    public MediaStorageUrlProviderAdapter(final MediaStorageProperties properties) {
        this.properties = Objects.requireNonNull(properties, "properties must not be null");
    }

    @Override
    public String getMediaStorageBaseUrl() {
        return properties.getBaseUrl();
    }
}

