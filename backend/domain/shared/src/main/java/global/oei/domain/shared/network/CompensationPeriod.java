package global.oei.domain.shared.network;

/**
 * Period a compensation figure is expressed over, mirrored one-to-one on the OEI OpenAPI
 * contract ({@code CompensationPeriod} schema) and the frontend's
 * {@code CompensationPeriod} union type (professional-profile.ts).
 */
public enum CompensationPeriod {
    YEAR,
    MONTH
}
