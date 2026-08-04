// Fee tiers deliberately reuse the exact grid already published on the public
// `/membres-fondateurs` page (`membresFondateurs.feeTiers.tiers.<index>` in
// `public/i18n/*.json`) — Étudiant 20€ / Membre 50€ / Membre fondateur 100€ / Membre
// soutien 250€ — rather than inventing a new pricing grid. `feeTierIndex` below maps each
// tier back to that same `<index>` so presentation components can reuse the existing i18n
// labels instead of duplicating them under a new namespace.
export type MembershipFeeTier = 'STUDENT' | 'MEMBER' | 'FOUNDING' | 'SUPPORTER';

export const MEMBERSHIP_FEE_TIERS: readonly MembershipFeeTier[] = ['STUDENT', 'MEMBER', 'FOUNDING', 'SUPPORTER'];

// Annual amount in euros, matching `membresFondateurs.feeTiers.tiers.<index>.amount`.
export const ANNUAL_FEE_BY_TIER: Readonly<Record<MembershipFeeTier, number>> = {
  STUDENT: 20,
  MEMBER: 50,
  FOUNDING: 100,
  SUPPORTER: 250,
};

// Index into `membresFondateurs.feeTiers.tiers` (see `membres-fondateurs.ts`'s
// `feeTierIndexes`), so the payment page can display the same localized tier label
// without duplicating it under a second i18n key.
export const FEE_TIER_GRID_INDEX: Readonly<Record<MembershipFeeTier, number>> = {
  STUDENT: 0,
  MEMBER: 1,
  FOUNDING: 2,
  SUPPORTER: 3,
};

export function annualFeeForTier(tier: MembershipFeeTier): number {
  return ANNUAL_FEE_BY_TIER[tier];
}
