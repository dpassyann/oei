package global.oei.domain.shared.membershipfee;

/**
 * Annual membership fee pricing grid, already published on {@code /membres-fondateurs}
 * (20€ / 50€ / 100€ / 250€ per year) — mirrored one-to-one on the OEI OpenAPI contract
 * ({@code MembershipFeeTier} schema) and on the frontend's
 * {@code domain/model/membership-fee/membership-fee-tier.ts}.
 *
 * <p>Deliberately distinct from {@link global.oei.domain.shared.membership.MembershipTier}:
 * that enum models the member's overall adhesion level (STANDARD/SILVER/GOLD/...), while
 * this one models the annual fee pricing bracket the member has chosen to pay at — the two
 * concepts are related in the product but not semantically identical, and the OpenAPI
 * contract already models them as two separate schemas, so they are kept as two separate
 * enums here rather than forcing a reuse that would not type-check against the contract.</p>
 */
public enum MembershipFeeTier {
    STUDENT,
    MEMBER,
    FOUNDING,
    SUPPORTER
}
