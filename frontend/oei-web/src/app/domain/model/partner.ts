export interface Partner {
  readonly id: string;
  readonly name: string;
  readonly logoUrl: string;
  readonly description: string;
  readonly websiteUrl: string;
  readonly category: string;
}

export function createPartner(fields: Partner): Partner {
  return Object.freeze({ ...fields });
}
