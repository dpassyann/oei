package global.oei.application.web.resource.certification;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.MemberCertificationsApi;
import global.oei.application.web.model.CertificationDTO;
import global.oei.application.web.model.CertificationDeclarationDTO;
import global.oei.application.web.model.MemberCertificationGoalDTO;
import global.oei.application.web.model.MemberCertificationGoalUpsertDTO;
import global.oei.application.web.resource.certification.adapter.CertificationAdapter;
import global.oei.application.web.resource.certification.mapper.CertificationDtoMapper;
import global.oei.domain.shared.certification.MemberCertificationGoalStatus;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link MemberCertificationsApi}: no stub left on this
 * interface.
 */
@RestController
@RequiredArgsConstructor
public class CertificationResource implements MemberCertificationsApi {

    private final CertificationAdapter certificationAdapter;

    @Override
    public ResponseEntity<List<CertificationDTO>> listMyCertifications() {
        final List<CertificationDTO> certifications =
                certificationAdapter.listMyCertifications().stream().map(CertificationDtoMapper::toDto).toList();
        return ResponseEntity.ok(certifications);
    }

    @Override
    public ResponseEntity<CertificationDTO> declareCertification(final CertificationDeclarationDTO declaration) {
        final var certification = certificationAdapter.declareCertification(
                declaration.getName(),
                declaration.getIssuingOrganization(),
                declaration.getRecognizedCertificationId() == null ? null : declaration.getRecognizedCertificationId().orElse(null),
                declaration.getIssuedAt(),
                declaration.getExpiresAt() == null ? null : declaration.getExpiresAt().orElse(null),
                declaration.getProofDocumentUrl() == null ? null : declaration.getProofDocumentUrl().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(CertificationDtoMapper.toDto(certification));
    }

    @Override
    public ResponseEntity<CertificationDTO> getMyCertification(final String id) {
        return certificationAdapter.getMyCertification(id)
                .map(CertificationDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<List<MemberCertificationGoalDTO>> listMyCertificationGoals() {
        final List<MemberCertificationGoalDTO> goals =
                certificationAdapter.listMyCertificationGoals().stream().map(CertificationDtoMapper::toDto).toList();
        return ResponseEntity.ok(goals);
    }

    @Override
    public ResponseEntity<MemberCertificationGoalDTO> upsertMyCertificationGoal(final MemberCertificationGoalUpsertDTO upsert) {
        final var goal = certificationAdapter.upsertMyCertificationGoal(
                upsert.getRecognizedCertificationId(), MemberCertificationGoalStatus.valueOf(upsert.getStatus().getValue()));
        return ResponseEntity.ok(CertificationDtoMapper.toDto(goal));
    }
}
