package global.oei.application.web.resource.member;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.AdminMembersApi;
import global.oei.application.web.model.AwardBadgeRequestDTO;
import global.oei.application.web.model.BadgeAwardDTO;
import global.oei.application.web.model.CertificationDTO;
import global.oei.application.web.model.MemberDTO;
import global.oei.application.web.model.VerificationRequestDTO;
import global.oei.application.web.resource.badge.mapper.BadgeDtoMapper;
import global.oei.application.web.resource.certification.mapper.CertificationDtoMapper;
import global.oei.application.web.resource.member.adapter.AdminMembersAdapter;
import global.oei.application.web.resource.member.mapper.MemberDtoMapper;
import global.oei.application.web.resource.verification.mapper.VerificationRequestDtoMapper;

/**
 * Implements every operation of {@link AdminMembersApi}: no stub left on this interface. This
 * tag bundles member oversight ({@code listAdminMembers}) together with the admin-side review
 * actions of three other bounded contexts (certifications, badges, verification requests) —
 * exactly as grouped by the {@code admin-members} OpenAPI tag; each delegates to that
 * context's own use case, only the HTTP surface is consolidated here.
 */
@RestController
@RequiredArgsConstructor
public class AdminMembersResource implements AdminMembersApi {

    private final AdminMembersAdapter adminMembersAdapter;

    @Override
    public ResponseEntity<List<MemberDTO>> listAdminMembers() {
        return ResponseEntity.ok(adminMembersAdapter.listAdminMembers().stream().map(MemberDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<CertificationDTO> validateCertification(final String id) {
        return adminMembersAdapter.validateCertification(id).map(CertificationDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<CertificationDTO> rejectCertification(final String id) {
        return adminMembersAdapter.rejectCertification(id).map(CertificationDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<BadgeAwardDTO> awardBadge(final String memberId, final AwardBadgeRequestDTO request) {
        final var award = adminMembersAdapter.awardBadge(memberId, request.getBadgeId());
        return ResponseEntity.status(HttpStatus.CREATED).body(BadgeDtoMapper.toDto(award));
    }

    @Override
    public ResponseEntity<VerificationRequestDTO> approveVerificationRequest(final String id) {
        return adminMembersAdapter.approveVerificationRequest(id).map(VerificationRequestDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<VerificationRequestDTO> rejectVerificationRequest(final String id) {
        return adminMembersAdapter.rejectVerificationRequest(id).map(VerificationRequestDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
