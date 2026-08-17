package global.oei.application.web.resource.content;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.PublicContentApi;
import global.oei.application.web.model.ContentVersionDTO;
import global.oei.application.web.model.ContentVersionPageDTO;
import global.oei.application.web.model.PageMetadataDTO;
import global.oei.application.web.resource.content.mapper.ContentDtoMapper;
import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentVersion;
import global.oei.domain.shared.content.ContentVersionPort;
import global.oei.domain.shared.content.ContentWorkflowStatus;

/**
 * Implements {@link PublicContentApi}: read-only public facade over the CMS {@link ContentPort}
 * / {@link ContentVersionPort} — only the {@link ContentWorkflowStatus#PUBLISHED} version of a
 * content is ever exposed here.
 */
@RestController
@RequiredArgsConstructor
public class PublicContentResource implements PublicContentApi {

    private final ContentPort contentPort;
    private final ContentVersionPort contentVersionPort;

    @Override
    public ResponseEntity<ContentVersionDTO> getPublicContent(final String slug, final String lang) {
        final Optional<Content> content = contentPort.findAll().stream()
                .filter(c -> c.slug().equals(slug) && c.status() == ContentWorkflowStatus.PUBLISHED)
                .findFirst();
        if (content.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        final List<ContentVersion> published = contentVersionPort.findByContentId(content.get().id()).stream()
                .filter(version -> version.status() == ContentWorkflowStatus.PUBLISHED)
                .toList();
        final List<ContentVersion> candidates =
                lang == null ? published : published.stream().filter(version -> version.language().equals(lang)).toList();
        final Optional<ContentVersion> match = candidates.stream().max(Comparator.comparing(ContentVersion::createdAt));
        return match.map(ContentDtoMapper::toDto).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ContentVersionPageDTO> listPublicDocumentVersions(final String slug) {
        final Optional<Content> content = contentPort.findAll().stream().filter(c -> c.slug().equals(slug)).findFirst();
        if (content.isEmpty()) {
            return ResponseEntity.ok(new ContentVersionPageDTO(List.of(), new PageMetadataDTO(0, 0, 0)));
        }
        final List<ContentVersionDTO> items = contentVersionPort.findByContentId(content.get().id()).stream()
                .filter(version -> version.status() == ContentWorkflowStatus.PUBLISHED)
                .sorted(Comparator.comparing(ContentVersion::createdAt).reversed())
                .map(ContentDtoMapper::toDto)
                .toList();
        return ResponseEntity.ok(new ContentVersionPageDTO(items, new PageMetadataDTO(0, items.size(), items.size())));
    }
}
