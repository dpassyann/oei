// The 6-rung expertise scale also used by the static `/certifications` level list
// (`certifications.levels.<index>` — see `certifications.ts`). A `RecognizedCertification`
// only ever *targets* one of these levels as reference material; per the spec warning
// ("Une certification ne confère jamais automatiquement le niveau Expert"), holding a
// certification never mechanically grants the matching OEI level — that judgment stays a
// separate, human/governance decision, never automated from `CertificationLevel` alone.
export type CertificationLevel = 'PRACTITIONER' | 'ENGINEER' | 'ARCHITECT' | 'EXPERT' | 'SENIOR_EXPERT' | 'FELLOW';

// How the OEI itself currently regards this catalog entry — distinct from `autoValidate`
// (which only controls the member self-declaration workflow). Surfaced as a filter/badge
// on the public `/certifications` catalog.
export type CertificationOeiStatus = 'OEI_RECOGNIZED' | 'PARTNER_RECOGNIZED' | 'UNDER_REVIEW' | 'NOT_RECOGNIZED';

// Documentary catalog of recognized certifications used to auto-validate a declaration
// (spec step "vérification du catalogue reconnu"). No dedicated CRUD endpoint per ADR
// 0002 — read-only reference data surfaced through the certification port.
//
// The fields below (`domain`/`level`/`language`/`oeiStatus`/`competencies`/`validityMonths`/
// `associatedPathRoute`) enrich this catalog entry for the public `/certifications` page
// (search/filters/cards — see "01-CERTIFICATIONS-AND-NEURAL-NETWORK-INTEGRATION.md",
// `/certifications` scope only; the "Professional Neural Network" graph part of that same
// spec is explicitly out of scope here). `domain`/`name`/`issuingOrganization`/`competencies`
// are catalog *data*, not UI chrome, so — like `RecognizedCertification.name` already did —
// they are plain strings rather than i18n keys.
export interface RecognizedCertification {
  readonly id: string;
  readonly name: string;
  readonly issuingOrganization: string;
  readonly catalogReference?: string;
  readonly autoValidate: boolean;
  /** Expertise domain this certification relates to (free-text catalog data, e.g. "Cybersécurité"). */
  readonly domain?: string;
  readonly level?: CertificationLevel;
  /** ISO 639-1 code of the certification exam's language (e.g. "en", "fr"). */
  readonly language?: string;
  readonly oeiStatus?: CertificationOeiStatus;
  /** Free-text description of the certification, surfaced by the admin catalog form
   * (`AdminCertificationCatalogForm`) — catalog data, not an i18n key, same rule as `name`. */
  readonly description?: string;
  /** Skills/competencies this certification is meant to cover (catalog data, not i18n keys). */
  readonly competencies?: readonly string[];
  /** How long the certification stays valid once obtained, in months. `null`/`undefined` means
   * it never expires. */
  readonly validityMonths?: number | null;
  /** Router path of the learning path associated with this certification, when one already
   * exists on the site (e.g. a future `/formation-continue`). `null`/`undefined` when no
   * relevant page exists yet — the UI then shows a disabled CTA with an "à venir" badge
   * instead of inventing a link. */
  readonly associatedPathRoute?: string | null;
}

export function createRecognizedCertification(fields: RecognizedCertification): RecognizedCertification {
  return Object.freeze({ ...fields });
}
