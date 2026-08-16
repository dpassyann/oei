package global.oei.domain.core.store;

import global.oei.domain.shared.store.BusinessCardCustomization;
import global.oei.domain.shared.store.BusinessCardPreview;
import global.oei.domain.shared.store.BusinessCardTemplate;
import global.oei.domain.shared.store.GenerateBusinessCardPreviewUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Renders a server-side HTML {@link BusinessCardPreview}, cheap enough to recompute on every
 * personalization step edit (see {@code 01-catalogue-produits.md §3.1} step 3). No PDF/image
 * rendering here — the same "build in HTML first" filière as the CV renderer.
 */
@Slf4j
@RequiredArgsConstructor
public class GenerateBusinessCardPreviewService implements GenerateBusinessCardPreviewUseCase {

    @Override
    public BusinessCardPreview execute(final BusinessCardCustomization customization, final BusinessCardTemplate template) {
        log.debug("GenerateBusinessCardPreviewService: execute called");
        final String html = "<div class=\"business-card business-card--" + template.id() + "\">"
                + "<h1>" + customization.displayName() + "</h1>"
                + "<p>" + customization.title() + "</p>"
                + "<p>" + customization.email() + "</p>"
                + (customization.phone() != null ? "<p>" + customization.phone() + "</p>" : "")
                + "<img alt=\"qr\" src=\"" + customization.qrCodeUrl() + "\"/>"
                + "<span class=\"tier tier--" + customization.membershipTierAtOrder() + "\"></span>"
                + "</div>";
        return new BusinessCardPreview(html);
    }
}
