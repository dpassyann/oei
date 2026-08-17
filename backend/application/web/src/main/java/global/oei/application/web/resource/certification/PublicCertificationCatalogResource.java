package global.oei.application.web.resource.certification;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.PublicCertificationsApi;
import global.oei.application.web.model.RecognizedCertificationDTO;
import global.oei.application.web.resource.certification.mapper.CertificationDtoMapper;
import global.oei.domain.shared.certification.CertificationCatalogStatus;
import global.oei.domain.shared.certification.RecognizedCertificationPort;

/**
 * Public, unauthenticated read-only view of the {@link RecognizedCertificationPort} catalog.
 *
 * <p>Implements {@link PublicCertificationsApi} generated from the OpenAPI path
 * {@code GET /api/public/v1/recognized-certifications}. Unlike the admin view
 * ({@link AdminCertificationCatalogResource}), this endpoint is listed under
 * {@code oei.security.public-urls} ({@code /api/public/**}) and therefore requires no
 * bearer token. Only {@code ACTIVE} entries are returned.</p>
 */
@RestController
@RequiredArgsConstructor
public class PublicCertificationCatalogResource implements PublicCertificationsApi {

    private final RecognizedCertificationPort recognizedCertificationPort;

    @Override
    public ResponseEntity<List<RecognizedCertificationDTO>> listPublicRecognizedCertifications(
            final Integer page, final Integer pageSize) {
        final int p = page == null ? 0 : page;
        final int ps = pageSize == null ? 100 : pageSize;
        final List<RecognizedCertificationDTO> active =
                recognizedCertificationPort.findCatalog(p, ps).items().stream()
                        .filter(rc -> rc.catalogStatus() == CertificationCatalogStatus.PUBLISHED)
                        .map(CertificationDtoMapper::toDto)
                        .toList();
        return ResponseEntity.ok(active);
    }
}


