// Documentary catalog of recognized certifications used to auto-validate a declaration
// (spec step "vérification du catalogue reconnu"). No dedicated CRUD endpoint per ADR
// 0002 — read-only reference data surfaced through the certification port.
export interface RecognizedCertification {
  readonly id: string;
  readonly name: string;
  readonly issuingOrganization: string;
  readonly catalogReference?: string;
  readonly autoValidate: boolean;
}

export function createRecognizedCertification(fields: RecognizedCertification): RecognizedCertification {
  return Object.freeze({ ...fields });
}
