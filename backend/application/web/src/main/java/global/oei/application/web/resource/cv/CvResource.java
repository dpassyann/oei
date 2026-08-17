package global.oei.application.web.resource.cv;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.MemberCvApi;
import global.oei.application.web.model.CvCreationDTO;
import global.oei.application.web.model.CvDTO;
import global.oei.application.web.model.CvRenderRequestDTO;
import global.oei.application.web.model.CvSectionDTO;
import global.oei.application.web.model.CvTemplateDTO;
import global.oei.application.web.model.CvTranslationDTO;
import global.oei.application.web.model.PdfGenerationJobDTO;
import global.oei.application.web.resource.cv.adapter.CvAdapter;
import global.oei.application.web.resource.cv.mapper.CvDtoMapper;
import global.oei.domain.shared.cv.CvSectionType;

/**
 * Implements every operation of {@link MemberCvApi}: no stub left on this interface. CV
 * PDF rendering ({@link #renderCv}) is explicitly mocked — see {@code RenderCvService}'s
 * Javadoc, same posture as {@code MemberWalletResource}'s wallet pass creation.
 */
@RestController
@RequiredArgsConstructor
public class CvResource implements MemberCvApi {

    private final CvAdapter cvAdapter;

    @Override
    public ResponseEntity<List<CvTemplateDTO>> listCvTemplates() {
        return ResponseEntity.ok(cvAdapter.listTemplates().stream().map(CvDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<List<CvDTO>> listMyCvs() {
        return ResponseEntity.ok(cvAdapter.listMyCvs().stream().map(CvDtoMapper::toDto).toList());
    }

    @Override
    public ResponseEntity<CvDTO> createCv(final CvCreationDTO cvCreationDTO) {
        final var cv = cvAdapter.createCv(cvCreationDTO.getTemplateId(), cvCreationDTO.getSourceLanguage());
        return ResponseEntity.status(HttpStatus.CREATED).body(CvDtoMapper.toDto(cv));
    }

    @Override
    public ResponseEntity<CvDTO> getCv(final String id) {
        return cvAdapter.getMyCv(id).map(CvDtoMapper::toDto).map(ResponseEntity::ok).orElseGet(
                () -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<CvDTO> updateCv(final String id, final CvCreationDTO cvCreationDTO) {
        return cvAdapter.updateMyCv(id, cvCreationDTO.getTemplateId(), cvCreationDTO.getSourceLanguage())
                .map(CvDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<CvSectionDTO> addCvSection(final String id, final CvSectionDTO cvSectionDTO) {
        return cvAdapter.addSection(
                        id, cvSectionDTO.getId(), CvSectionType.valueOf(cvSectionDTO.getType().name()),
                        cvSectionDTO.getOrder(), cvSectionDTO.getContent())
                .map(CvDtoMapper::toDto)
                .map(section -> ResponseEntity.status(HttpStatus.CREATED).body(section))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<CvSectionDTO> updateCvSection(final String id, final String sectionId, final CvSectionDTO cvSectionDTO) {
        return cvAdapter.updateSection(
                        id, sectionId, CvSectionType.valueOf(cvSectionDTO.getType().name()), cvSectionDTO.getOrder(),
                        cvSectionDTO.getContent())
                .map(CvDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<CvTranslationDTO> requestCvSectionTranslation(
            final String id, final String sectionId, final CvTranslationDTO cvTranslationDTO) {
        return cvAdapter.requestSectionTranslation(
                        id, sectionId, cvTranslationDTO.getId(), cvTranslationDTO.getLanguage(), cvTranslationDTO.getContent())
                .map(CvDtoMapper::toDto)
                .map(translation -> ResponseEntity.status(HttpStatus.CREATED).body(translation))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<CvTranslationDTO> validateCvSectionTranslation(final String id, final String sectionId, final String language) {
        return cvAdapter.validateSectionTranslation(id, sectionId, language)
                .map(CvDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<PdfGenerationJobDTO> renderCv(final String id, final CvRenderRequestDTO cvRenderRequestDTO) {
        return cvAdapter.renderCv(id, cvRenderRequestDTO.getLanguage(), cvRenderRequestDTO.getIncludeBadges())
                .map(CvDtoMapper::toDto)
                .map(job -> ResponseEntity.status(HttpStatus.ACCEPTED).body(job))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
