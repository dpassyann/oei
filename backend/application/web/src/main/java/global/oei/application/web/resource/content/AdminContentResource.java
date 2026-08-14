package global.oei.application.web.resource.content;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.AdminContentApi;
import global.oei.application.web.model.ContentApprovalCreationDTO;
import global.oei.application.web.model.ContentApprovalDTO;
import global.oei.application.web.model.ContentContributionDTO;
import global.oei.application.web.model.ContentCreationDTO;
import global.oei.application.web.model.ContentDTO;
import global.oei.application.web.model.ContentPageDTO;
import global.oei.application.web.model.ContentPublicationDTO;
import global.oei.application.web.model.ContentSourceTypeDTO;
import global.oei.application.web.model.ContentTranslationDTO;
import global.oei.application.web.model.ContentTypeDTO;
import global.oei.application.web.model.ContentVersionCreationDTO;
import global.oei.application.web.model.ContentVersionDTO;
import global.oei.application.web.model.ContentVersionPageDTO;
import global.oei.application.web.model.ContentWorkflowStatusDTO;
import global.oei.application.web.model.PageMetadataDTO;
import global.oei.application.web.model.RejectAdminContentRequestDTO;
import global.oei.application.web.resource.content.adapter.ContentAdapter;
import global.oei.application.web.resource.content.mapper.ContentDtoMapper;
import global.oei.domain.shared.content.ContentApprovalDecision;
import global.oei.domain.shared.content.ContentApprovalRole;
import global.oei.domain.shared.content.ContentGovernance;
import global.oei.domain.shared.content.ContentSourceType;
import global.oei.domain.shared.content.ContentTranslationStatus;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentWorkflowStatus;
import lombok.RequiredArgsConstructor;

/**
 * Implements every operation of {@link AdminContentApi}: no stub left on this interface.
 */
@RestController
@RequiredArgsConstructor
public class AdminContentResource implements AdminContentApi {

    private final ContentAdapter contentAdapter;

    @Override
    public ResponseEntity<ContentPageDTO> listAdminContent(
            final ContentTypeDTO type, final ContentWorkflowStatusDTO status, final String lang, final String tag, final String q) {
        final List<ContentDTO> items = contentAdapter
                .listContent(
                        type == null ? null : ContentType.valueOf(type.name()),
                        status == null ? null : ContentWorkflowStatus.valueOf(status.name()), lang, tag, q)
                .stream()
                .map(ContentDtoMapper::toDto)
                .toList();
        return ResponseEntity.ok(new ContentPageDTO(items, new PageMetadataDTO(0, items.size(), items.size())));
    }

    @Override
    public ResponseEntity<ContentDTO> createAdminContent(final ContentCreationDTO dto) {
        final var content = contentAdapter.createContent(
                ContentType.valueOf(dto.getType().name()), dto.getSlug(), ContentSourceType.valueOf(dto.getSourceType().name()),
                dto.getTitle(), dto.getTags(),
                dto.getGovernance() == null
                        ? null
                        : new ContentGovernance(
                                Boolean.TRUE.equals(dto.getGovernance().getApprovalRequired()),
                                dto.getGovernance().getDecisionId() == null ? null : dto.getGovernance().getDecisionId().orElse(null)));
        return ResponseEntity.status(HttpStatus.CREATED).body(ContentDtoMapper.toDto(content));
    }

    @Override
    public ResponseEntity<ContentDTO> getAdminContent(final String id) {
        return contentAdapter.getContent(id).map(ContentDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentVersionDTO> updateAdminContent(final String id, final ContentVersionCreationDTO dto) {
        return contentAdapter.updateContent(id, dto.getLanguage(), dto.getTitle(), dto.getBody(), dto.getFrontMatter())
                .map(ContentDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentVersionPageDTO> listAdminContentVersions(final String id) {
        final List<ContentVersionDTO> items = contentAdapter.listVersions(id).stream().map(ContentDtoMapper::toDto).toList();
        return ResponseEntity.ok(new ContentVersionPageDTO(items, new PageMetadataDTO(0, items.size(), items.size())));
    }

    @Override
    public ResponseEntity<ContentDTO> submitAdminContent(final String id) {
        return contentAdapter.submitContent(id).map(ContentDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentApprovalDTO> approveAdminContent(final String id, final ContentApprovalCreationDTO dto) {
        return contentAdapter
                .approveContent(
                        id, ContentApprovalRole.valueOf(dto.getRole().name()), ContentApprovalDecision.valueOf(dto.getDecision().name()),
                        dto.getComment())
                .map(ContentDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentDTO> rejectAdminContent(final String id, final RejectAdminContentRequestDTO dto) {
        return contentAdapter.rejectContent(id, dto.getComment()).map(ContentDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentDTO> requestAdminContentTranslation(final String id) {
        return contentAdapter.requestTranslation(id).map(ContentDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentDTO> scheduleAdminContent(final String id) {
        return contentAdapter.scheduleContent(id).map(ContentDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentPublicationDTO> publishAdminContent(final String id) {
        return contentAdapter.publishContent(id).map(ContentDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentDTO> archiveAdminContent(final String id) {
        return contentAdapter.archiveContent(id).map(ContentDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentTranslationDTO> createAdminContentTranslation(final String id, final ContentTranslationDTO dto) {
        return contentAdapter
                .createTranslation(id, dto.getLanguage(), ContentTranslationStatus.valueOf(dto.getStatus().name()),
                        dto.getTranslatorId() == null ? null : dto.getTranslatorId().orElse(null))
                .map(ContentDtoMapper::toDto)
                .map(translation -> ResponseEntity.status(HttpStatus.CREATED).body(translation))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentTranslationDTO> validateAdminContentTranslation(final String id, final String language) {
        return contentAdapter.validateTranslation(id, language).map(ContentDtoMapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<List<ContentContributionDTO>> listAdminContentContributions(final String id) {
        return ResponseEntity.ok(contentAdapter.listContributions(id).stream().map(ContentDtoMapper::toDto).toList());
    }
}
