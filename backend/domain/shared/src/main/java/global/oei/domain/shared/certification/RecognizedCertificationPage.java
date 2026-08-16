package global.oei.domain.shared.certification;

import java.util.List;

/**
 * One page of the {@link RecognizedCertification} catalog — mirrors {@code PageMetadata}'s
 * shape (page/pageSize/totalItems), same pattern as {@code NetworkExpertPage}'s
 * offset/limit pagination but page-index based, consistent with the {@code ContentPage}
 * admin-listing schema this catalog listing reuses.
 */
public record RecognizedCertificationPage(List<RecognizedCertification> items, int page, int pageSize, long totalItems) {

    public RecognizedCertificationPage {
        items = List.copyOf(items == null ? List.of() : items);
    }
}
