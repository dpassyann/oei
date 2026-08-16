package global.oei.domain.shared.store;

/**
 * How a {@link ProductCategory} is physically honored once an {@link Order} is paid. Both
 * kinds are mocked in this iteration (see {@link Order}'s Javadoc): no real courier/printer is
 * ever called, this is only a semantic distinction kept for a future V2
 * {@code FulfillmentProviderPort} (enum strategy + binder, exactly like {@code PaymentMethod}).
 */
public enum FulfillmentKind {
    /** Goodies and other physical merchandise shipped as-is (e.g. the OEI pen). */
    PHYSICAL_GOODS,
    /** A digital OEI asset printed and shipped (business card, CV, White Paper). */
    PRINT_AND_SHIP
}
