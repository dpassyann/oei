package global.oei.application.web.resource.member;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.MemberProfileImportApi;
import global.oei.application.web.model.LinkedinOAuthCallbackRequestDTO;
import global.oei.application.web.model.ProfessionalProfileDTO;
import global.oei.application.web.model.ProfileImportDTO;
import global.oei.application.web.resource.member.adapter.ProfileImportAdapter;
import global.oei.application.web.resource.member.mapper.ProfileDtoMapper;
import global.oei.application.web.resource.member.mapper.ProfileImportDtoMapper;
import global.oei.domain.shared.profileimport.ProfileImportSource;

/**
 * Sole implementer of {@link MemberProfileImportApi}: implements the Smart CV Import status
 * machine (upload → status polling) and the LinkedIn OAuth callback. Only one
 * {@code @RestController} may implement a given generated API interface (see
 * {@code MemberProfileResource}'s Javadoc) — every other {@code member-profile-import}
 * operation ({@code getProfileImportDraft}/{@code updateProfileImportDraft}/
 * {@code confirmProfileImport}) is deliberately left at the interface's default
 * {@code 501 Not Implemented}: they depend on the AI-extracted draft, which this track's
 * scope (status machine + plumbing only) does not produce — see
 * {@code AdvanceProfileImportUseCase}'s Javadoc for that seam.
 */
@RestController
@RequiredArgsConstructor
public class ProfileImportResource implements MemberProfileImportApi {

    private final ProfileImportAdapter profileImportAdapter;

    @Override
    public ResponseEntity<ProfileImportDTO> initiateProfileImportFromCv(
            final MultipartFile file, final String consentVersion) {
        final var session = profileImportAdapter.initiateFromCv(sourceOf(file));
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(ProfileImportDtoMapper.toDto(session));
    }

    @Override
    public ResponseEntity<ProfileImportDTO> getProfileImport(final String importId) {
        return profileImportAdapter.getMyProfileImport(importId)
                .map(ProfileImportDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ProfessionalProfileDTO> importLinkedinBasicProfileFromCallback(
            final LinkedinOAuthCallbackRequestDTO linkedinOAuthCallbackRequestDTO) {
        final var profile = profileImportAdapter.importLinkedinBasicWithAuthorizationCode(
                linkedinOAuthCallbackRequestDTO.getAuthorizationCode(),
                linkedinOAuthCallbackRequestDTO.getRedirectUri());
        return ResponseEntity.ok(ProfileDtoMapper.toDto(profile));
    }

    /**
     * Derives the pipeline's {@link ProfileImportSource} from the uploaded file's declared
     * content type (falling back to its filename extension) — the OpenAPI contract accepts a
     * raw {@code multipart/form-data} file, not an explicit source field.
     */
    private static ProfileImportSource sourceOf(final MultipartFile file) {
        final String contentType = file.getContentType();
        if ("application/pdf".equals(contentType)) {
            return ProfileImportSource.CV_PDF;
        }
        if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)) {
            return ProfileImportSource.CV_DOCX;
        }
        final String filename = file.getOriginalFilename();
        if (filename != null) {
            final String lower = filename.toLowerCase();
            if (lower.endsWith(".pdf")) {
                return ProfileImportSource.CV_PDF;
            }
            if (lower.endsWith(".docx")) {
                return ProfileImportSource.CV_DOCX;
            }
        }
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Unsupported CV document type: only PDF and DOCX are accepted");
    }
}
