// Admin-facing view of a member's account, distinct from the public/self-service `Member`
// (`domain/model/identity/member.ts`): it exposes operational fields an admin needs — dues
// status and membership status — that a member never sees about themself in this shape.
// Task brief §Membres: "consulter le statut de cotisation, resynchroniser un paiement,
// suspendre/lever suspension, statuts exceptionnels".

// Mirrors the reasoning already used for the public-facing `MembershipFeeStatus`
// (`domain/model/membership-fee/membership-fee-status.ts`), reduced to the tri-state an admin
// needs to scan a list at a glance rather than the full prorated-amount computation.
export type AdminMemberDuesStatus = 'PAID' | 'UNPAID' | 'EXPIRED';

// `ACTIVE`/`SUSPENDED` are the two operational states (task brief: "suspendre pour abus, lever
// une suspension"); `EXCEPTIONAL_FREE`/`EXCEPTIONAL_HONORARY` are the "statuts exceptionnels" the
// brief calls out (e.g. free membership granted, honorary member) — both bypass the normal dues
// cycle without being a disciplinary suspension.
export type AdminMemberStatus = 'ACTIVE' | 'SUSPENDED' | 'EXCEPTIONAL_FREE' | 'EXCEPTIONAL_HONORARY';

export interface AdminMemberSummary {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly country: string;
  readonly duesStatus: AdminMemberDuesStatus;
  readonly membershipStatus: AdminMemberStatus;
  readonly lastPaymentAt: string | null;
  readonly suspendedReason: string | null;
}

export function createAdminMemberSummary(fields: AdminMemberSummary): AdminMemberSummary {
  return Object.freeze({ ...fields });
}
