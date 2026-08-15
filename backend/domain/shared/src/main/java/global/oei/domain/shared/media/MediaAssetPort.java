package global.oei.domain.shared.media;

import java.util.List;

/**
 * Outbound port for {@link MediaAsset}.
 */
public interface MediaAssetPort {

    MediaAsset save(MediaAsset asset);

    List<MediaAsset> findAll();
}
