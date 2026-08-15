package global.oei.application.web.resource.media;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import global.oei.application.web.AdminMediaApi;
import global.oei.application.web.model.MediaAssetDTO;
import global.oei.application.web.resource.media.mapper.MediaAssetDtoMapper;
import global.oei.domain.shared.media.MediaAssetPort;
import global.oei.domain.shared.media.UploadMediaAssetUseCase;
import global.oei.domain.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;

/**
 * Implements {@link AdminMediaApi}. See {@code UploadMediaAssetService}'s Javadoc: no real
 * object storage backend is wired, the uploaded {@link MultipartFile}'s bytes are read only to
 * report their size, never actually stored.
 */
@RestController
@RequiredArgsConstructor
public class AdminMediaResource implements AdminMediaApi {

    private final MediaAssetPort mediaAssetPort;
    private final UploadMediaAssetUseCase uploadMediaAssetUseCase;
    private final SecurityContextPort securityContextPort;

    @Override
    public ResponseEntity<List<MediaAssetDTO>> listMediaAssets() {
        return ResponseEntity.ok(mediaAssetPort.findAll().stream().map(MediaAssetDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<MediaAssetDTO> uploadMediaAsset(final MultipartFile file) {
        final String uploadedBy = securityContextPort.currentIdentity()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED))
                .subject();
        final var asset = uploadMediaAssetUseCase.execute(file.getOriginalFilename(), file.getContentType(), fileSize(file), uploadedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(MediaAssetDtoMapper.toDto(asset));
    }

    private static long fileSize(final MultipartFile file) {
        try {
            return file.getSize();
        } catch (final RuntimeException e) {
            return 0L;
        }
    }
}
