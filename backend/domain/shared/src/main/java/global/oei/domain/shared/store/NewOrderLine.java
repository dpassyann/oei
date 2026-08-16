package global.oei.domain.shared.store;

import java.util.Objects;

/**
 * Input to {@link CreateOrderUseCase}: what the client asks for a single line, before server-side
 * price resolution turns it into an {@link OrderLine}.
 */
public record NewOrderLine(String productId, int quantity, BusinessCardCustomization businessCardCustomization, String sourceReferenceId) {

    public NewOrderLine {
        Objects.requireNonNull(productId, "productId must not be null");
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity must be positive");
        }
    }
}
