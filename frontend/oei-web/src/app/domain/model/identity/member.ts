import { Membership } from '../membership/membership';

// `legalName` mirrors the OpenAPI `Member` schema comment: it must never be exposed
// without a legal basis (e.g. verification, contractual necessity) — the presentation
// layer must only ever display `displayName` publicly, never `legalName`, unless an
// explicit verified/legal context requires it.
export interface Member {
  readonly id: string;
  readonly publicSlug: string;
  readonly displayName: string;
  readonly legalName?: string;
  readonly locale: string;
  readonly country: string;
  readonly createdAt: string;
  readonly membership?: Membership;
}

export function createMember(fields: Member): Member {
  return Object.freeze({ ...fields });
}
