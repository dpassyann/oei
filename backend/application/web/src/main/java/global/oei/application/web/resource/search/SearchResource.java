package global.oei.application.web.resource.search;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import global.oei.application.web.SearchApi;
import global.oei.application.web.model.SearchResultDTO;
import global.oei.domain.shared.content.Content;
import global.oei.domain.shared.content.ContentPort;
import global.oei.domain.shared.content.ContentType;
import global.oei.domain.shared.content.ContentWorkflowStatus;
import global.oei.domain.shared.home.HomeNewsItem;
import global.oei.domain.shared.home.HomeNewsPort;

/**
 * Implements {@link SearchApi}: V1 scope only (resources + news, per the operation's OpenAPI
 * summary). "Resources" are published, non-{@code NEWS}/{@code PAGE} CMS {@link Content}
 * (articles, whitepapers, manifestos), matched against {@link ContentPort#search}; "news" come
 * from {@link HomeNewsPort} (the {@code home-legacy} news list). Both are filtered in memory
 * by {@code q} (case-insensitive title/excerpt match) — same "real but not indexed" posture as
 * {@link ContentPort#search}'s Javadoc.
 */
@RestController
@RequiredArgsConstructor
public class SearchResource implements SearchApi {

    private final ContentPort contentPort;
    private final HomeNewsPort homeNewsPort;

    @Override
    public ResponseEntity<List<SearchResultDTO>> searchPublicContent(final String q, final String types, final String locale) {
        final Set<String> requestedTypes = types == null
                ? Set.of("RESOURCE", "NEWS")
                : Arrays.stream(types.split(",")).map(type -> type.trim().toUpperCase(Locale.ROOT)).collect(Collectors.toSet());
        final String lang = locale == null ? "fr" : locale;
        final List<SearchResultDTO> results = new ArrayList<>();
        if (requestedTypes.contains("RESOURCE")) {
            for (final Content content : contentPort.search(null, ContentWorkflowStatus.PUBLISHED, null, null, q)) {
                if (content.type() != ContentType.NEWS && content.type() != ContentType.PAGE) {
                    final SearchResultDTO dto = new SearchResultDTO(
                            SearchResultDTO.TypeEnum.RESOURCE, content.title(), content.title(), "/ressources");
                    dto.setFragment(content.slug());
                    results.add(dto);
                }
            }
        }
        if (requestedTypes.contains("NEWS")) {
            for (final HomeNewsItem news : homeNewsPort.findByLang(lang, null)) {
                if (matches(news, q)) {
                    results.add(new SearchResultDTO(SearchResultDTO.TypeEnum.NEWS, news.title(), news.excerpt(), news.path()));
                }
            }
        }
        return ResponseEntity.ok(results);
    }

    private static boolean matches(final HomeNewsItem news, final String q) {
        final String needle = q.toLowerCase(Locale.ROOT);
        return news.title().toLowerCase(Locale.ROOT).contains(needle) || news.excerpt().toLowerCase(Locale.ROOT).contains(needle);
    }
}
