package global.oei.application.web.resource.content;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import global.oei.application.web.ContentLegacyApi;
import global.oei.application.web.model.ContentDocumentDTO;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentVersionPort;
import global.oei.domain.shared.content.ContentWorkflowStatus;
import lombok.RequiredArgsConstructor;

/**
 * Implements the legacy, unversioned {@code getContent} operation directly against
 * {@link ContentPort}/{@link ContentVersionPort} — a single read, no dedicated adapter/service
 * layer needed (see the spring-boot-ddd-backend skill's "pure CRUD-ish operations" rule).
 *
 * <p>The contract declares no {@code 404} response for this legacy shape: when the slug is
 * unknown, or no version exists in the requested language, a placeholder document with
 * {@code isFallback=true} is returned instead of an error, matching the field's documented
 * purpose ("rendu historique, ne pas modifier la forme").</p>
 */
@RestController
@RequiredArgsConstructor
public class ContentLegacyResource implements ContentLegacyApi {

    private final ContentPort contentPort;
    private final ContentVersionPort contentVersionPort;

    @Override
    public ResponseEntity<ContentDocumentDTO> getContent(final String lang, final String slug) {
        final String resolvedLang = resolveLang(lang);
        return contentPort.findAll().stream()
                .filter(content -> content.slug().equals(slug))
                .findFirst()
                .flatMap(content -> contentVersionPort.findByContentId(content.id()).stream()
                        .filter(version -> version.language().equals(resolvedLang))
                        .filter(version -> version.status() == ContentWorkflowStatus.PUBLISHED)
                        .max((left, right) -> left.createdAt().compareTo(right.createdAt()))
                        .map(version -> new ContentDocumentDTO(slug, resolvedLang, version.title(), version.body(), false)))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(new ContentDocumentDTO(
                        slug,
                        resolvedLang,
                        "Content not available",
                        "The requested content is not available yet.",
                        true)));
    }

    private static String resolveLang(final String langFromPath) {
        final ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return langFromPath;
        }
        final String preferredLang = attributes.getRequest().getHeader("preferred_lang");
        if (preferredLang == null || preferredLang.isBlank()) {
            return langFromPath;
        }
        return preferredLang;
    }
}
