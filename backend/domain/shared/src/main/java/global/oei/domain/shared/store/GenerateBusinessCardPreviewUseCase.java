package global.oei.domain.shared.store;

/**
 * Renders a live HTML {@link BusinessCardPreview} for a {@link BusinessCardCustomization} in
 * progress, before the member validates their order (see {@code 01-catalogue-produits.md §3}).
 */
public interface GenerateBusinessCardPreviewUseCase {

    BusinessCardPreview execute(BusinessCardCustomization customization, BusinessCardTemplate template);
}
