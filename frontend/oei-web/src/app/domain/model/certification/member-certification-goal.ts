// Per-member tracking of a `RecognizedCertification` catalog entry, from first discovery to
// obtaining (or losing) it. Distinct from `Certification` (a member's own self-declared
// certification, subject to the DECLARED → VALIDATED workflow): a `MemberCertificationGoal`
// only ever tracks *intent/progress* towards a catalog entry, it never validates anything by
// itself. Per the spec warning, reaching `OBTAINED` never automatically grants an OEI expertise
// level — that stays a separate governance decision, not derived from this model.
export type MemberCertificationGoalStatus = 'DISCOVER' | 'PLANNED' | 'PREPARING' | 'PASSED' | 'OBTAINED' | 'EXPIRED';

export interface MemberCertificationGoal {
  readonly id: string;
  readonly memberId: string;
  readonly recognizedCertificationId: string;
  readonly status: MemberCertificationGoalStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// What the member CTAs on a `/certifications` card actually submit — the server assigns
// `id`/`memberId`/timestamps, and upserts by `recognizedCertificationId` (one goal per member
// per catalog entry, its status simply moves forward as the member interacts with the CTAs).
export interface MemberCertificationGoalUpsert {
  readonly recognizedCertificationId: string;
  readonly status: MemberCertificationGoalStatus;
}

export function createMemberCertificationGoal(fields: MemberCertificationGoal): MemberCertificationGoal {
  return Object.freeze({ ...fields });
}
