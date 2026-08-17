package global.oei.application.web.resource.certification;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.AdminCertificationsApi;
import global.oei.application.web.model.RecognizedCertificationDTO;
import global.oei.application.web.model.RecognizedCertificationPageDTO;
import global.oei.application.web.model.RecognizedCertificationUpsertDTO;
import global.oei.application.web.resource.certification.adapter.CertificationAdapter;
import global.oei.application.web.resource.certification.mapper.CertificationDtoMapper;
import global.oei.domain.shared.certification.RecognizedCertification;

/**
 * Implements every operation of {@link AdminCertificationsApi}: no stub left on this
 * interface. Governs the public {@code /certifications} catalog ({@code
 * RecognizedCertification}), distinct from {@code CertificationResource}'s member-facing
 * declaration workflow and from the {@code validateCertification}/{@code rejectCertification}
 * operations on those individual declarations (tag {@code admin-members}) — see ADR 0002,
 * which had left this catalog schema without any dedicated endpoint.
 */
@RestController
@RequiredArgsConstructor
public class AdminCertificationCatalogResource implements AdminCertificationsApi {

    private final CertificationAdapter certificationAdapter;

    @Override
    public ResponseEntity<RecognizedCertificationPageDTO> listAdminRecognizedCertifications(final Integer page, final Integer pageSize) {
        final RecognizedCertificationPageDTO result = CertificationDtoMapper.toDto(
                certificationAdapter.listRecognizedCertificationCatalog(page == null ? 0 : page, pageSize == null ? 20 : pageSize));
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<RecognizedCertificationDTO> createAdminRecognizedCertification(final RecognizedCertificationUpsertDTO dto) {
        final RecognizedCertification submitted = CertificationDtoMapper.fromUpsertDto(dto);
        final RecognizedCertification created = certificationAdapter.createRecognizedCertificationCatalogEntry(
                submitted.name(), submitted.issuingOrganization(), submitted.catalogReference(), submitted.autoValidate(),
                submitted.domain(), submitted.level(), submitted.language(), submitted.oeiStatus(), submitted.competencies(),
                submitted.validityMonths(), submitted.associatedPathRoute(), submitted.description());
        return ResponseEntity.status(HttpStatus.CREATED).body(CertificationDtoMapper.toDto(created));
    }

    @Override
    public ResponseEntity<RecognizedCertificationDTO> updateAdminRecognizedCertification(
            final String id, final RecognizedCertificationUpsertDTO dto) {
        return certificationAdapter.updateRecognizedCertificationCatalogEntry(id, CertificationDtoMapper.fromUpsertDto(dto))
                .map(CertificationDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<RecognizedCertificationDTO> archiveAdminRecognizedCertification(final String id) {
        return certificationAdapter.archiveRecognizedCertificationCatalogEntry(id)
                .map(CertificationDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
