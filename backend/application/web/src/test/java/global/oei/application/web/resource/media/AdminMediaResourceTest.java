package global.oei.application.web.resource.media;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import global.oei.domain.shared.media.MediaAsset;
import global.oei.domain.shared.media.MediaAssetPort;
import global.oei.domain.shared.media.MediaScanStatus;
import global.oei.domain.shared.media.UploadMediaAssetUseCase;
import global.oei.domain.shared.security.AuthenticatedIdentity;
import global.oei.domain.shared.security.SecurityContextPort;

class AdminMediaResourceTest {

    private MediaAssetPort mediaAssetPort;
    private UploadMediaAssetUseCase uploadMediaAssetUseCase;
    private SecurityContextPort securityContextPort;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mediaAssetPort = mock(MediaAssetPort.class);
        uploadMediaAssetUseCase = mock(UploadMediaAssetUseCase.class);
        securityContextPort = mock(SecurityContextPort.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new AdminMediaResource(mediaAssetPort, uploadMediaAssetUseCase, securityContextPort))
                .build();
    }

    @Test
    void listMediaAssets_returnsAllAssets() throws Exception {
        final MediaAsset asset = new MediaAsset(
                "media-1", "logo.png", "https://mock-media.oei.local/media-1/logo.png", "image/png", 1024L, "admin-1", Instant.now(),
                MediaScanStatus.CLEAN);
        when(mediaAssetPort.findAll()).thenReturn(List.of(asset));

        mockMvc.perform(get("/api/admin/v1/media"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].filename").value("logo.png"));
    }

    @Test
    void uploadMediaAsset_returnsCreatedAsset() throws Exception {
        when(securityContextPort.currentIdentity())
                .thenReturn(Optional.of(new AuthenticatedIdentity("admin-1", null, null, Set.of("admin"), null)));
        final MediaAsset asset = new MediaAsset(
                "media-2", "banner.png", "https://mock-media.oei.local/media-2/banner.png", "image/png", 4L, "admin-1", Instant.now(),
                MediaScanStatus.CLEAN);
        when(uploadMediaAssetUseCase.execute("banner.png", "image/png", 4L, "admin-1")).thenReturn(asset);
        final MockMultipartFile file = new MockMultipartFile("file", "banner.png", "image/png", "1234".getBytes());

        mockMvc.perform(multipart("/api/admin/v1/media").file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.filename").value("banner.png"));
    }
}
