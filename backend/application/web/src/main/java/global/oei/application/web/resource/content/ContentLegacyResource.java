package global.oei.application.web.resource.content;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import global.oei.application.web.ContentLegacyApi;
import global.oei.application.web.model.ContentDocumentDTO;
import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentVersion;
import global.oei.domain.shared.content.ContentVersionPort;
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
        final Optional<Content> content = contentPort.findAll().stream().filter(c -> c.slug().equals(slug)).findFirst();
        if (content.isEmpty()) {
            return ResponseEntity.ok(new ContentDocumentDTO(slug, lang, slug, "", true));
        }
        final List<ContentVersion> versions = contentVersionPort.findByContentId(content.get().id());
        final Optional<ContentVersion> exactLanguage = versions.stream().filter(v -> v.language().equals(lang))
                .max(Comparator.comparing(ContentVersion::createdAt));
        if (exactLanguage.isPresent()) {
            final ContentVersion version = exactLanguage.get();
            return ResponseEntity.ok(new ContentDocumentDTO(slug, lang, version.title(), version.body(), false));
        }
        final Optional<ContentVersion> anyVersion = versions.stream().max(Comparator.comparing(ContentVersion::createdAt));
        return anyVersion
                .map(version -> ResponseEntity.ok(new ContentDocumentDTO(slug, lang, version.title(), version.body(), true)))
                .orElseGet(() -> ResponseEntity.ok(new ContentDocumentDTO(slug, lang, content.get().title(), "", true)));
    }
}
