package global.oei.domain.core.store;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import global.oei.domain.shared.store.BusinessCardCustomization;
import global.oei.domain.shared.store.BusinessCardPreview;
import global.oei.domain.shared.store.BusinessCardTemplate;

class GenerateBusinessCardPreviewServiceTest {

    private final GenerateBusinessCardPreviewService service = new GenerateBusinessCardPreviewService();

    @Test
    void execute_rendersHtmlContainingCustomizationFields() {
        final BusinessCardTemplate template = new BusinessCardTemplate("tpl1", "Classic", "https://example.com/preview.png");
        final BusinessCardCustomization customization =
                new BusinessCardCustomization("tpl1", "Jane Doe", "President", "jane@oei.global", "+33600000000", "https://example.com/qr.png", "GOLD");

        final BusinessCardPreview preview = service.execute(customization, template);

        assertThat(preview.html()).contains("Jane Doe", "President", "jane@oei.global", "+33600000000", "tier--GOLD", "tpl1");
    }
}
