export type Availability = 'AVAILABLE' | 'OPEN_TO_OPPORTUNITIES' | 'NOT_AVAILABLE';

export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'NATIVE';

export interface LanguageProficiency {
  readonly language: string;
  readonly level: LanguageLevel;
}

export interface Experience {
  readonly id: string;
  readonly organization: string;
  readonly title: string;
  readonly startDate: string;
  readonly endDate?: string | null;
  readonly current?: boolean;
  readonly description?: string;
  // Demonstration data must always be explicitly flagged so it can never be mistaken
  // for a real member's history — see spec requirement "données de démonstration honnêtes".
  readonly isDemoData?: boolean;
  // The member's own gross annual salary ("salaire brut annuel") for THIS experience.
  // Deliberately private, always — same rule as `CurrentCompensation` below: never part of
  // `PublicProfile.visibleFields`, never rendered on the digital business card/CV/member
  // directory, never sent to any `/api/public/**` endpoint. Saving/updating an experience that
  // carries this field is the trigger for a `compensation_declaration` row feeding the
  // anonymized Professional Neural Network salary-transparency aggregate — never an
  // individually-visible figure. Required together with `salaryCurrency`.
  readonly grossAnnualSalary?: number;
  // ISO 4217 currency code (e.g. "CHF", "EUR") for `grossAnnualSalary` — free text, same
  // convention as `CurrentCompensation.currency`. Required together with `grossAnnualSalary`.
  readonly salaryCurrency?: string;
}

export interface Education {
  readonly id: string;
  readonly institution: string;
  readonly program: string;
  readonly startDate: string;
  readonly endDate?: string | null;
  readonly description?: string;
}

export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly verified?: boolean;
}

// All optional, and every link is a full URL edited as plain text (same "no dedicated
// upload/OAuth pipeline yet" limitation as `photoUrl`). Unlike `currentCompensation` below,
// these ARE meant to be shareable — a member can opt to expose them on their public profile
// via `PublicProfile.visibleFields` (see `public-profile.ts`'s `'socialLinks'` entry).
export interface SocialLinks {
  readonly linkedin?: string;
  readonly github?: string;
  readonly x?: string;
  readonly website?: string;
  readonly youtube?: string;
}

export type CompensationPeriod = 'YEAR' | 'MONTH';

// Deliberately private, always. This field is NEVER part of `PublicProfile.visibleFields`
// (see `PUBLIC_PROFILE_VISIBLE_FIELD_KEYS` in `public-profile.ts` — `currentCompensation` is
// intentionally absent from that list, not just unchecked by default), never rendered on the
// digital business card / CV / member directory, and never sent to any `/api/public/**`
// endpoint. Its purpose is twofold, both aggregate-only uses of the member's own figure, never
// a direct exposure of it:
// - let the member compare their own situation against the anonymized aggregate range computed
//   by `SalaryBenchmarkService` (matched on `expertiseAreas` + `currency` + `period`);
// - feed the Professional Neural Network's anonymized salary transparency feature
//   (`NetworkSalaryInsight`, see `domain/model/network/network-salary-insight.model.ts`), which
//   aggregates declarations by graph node (domain/topic/certification) and, additionally, by
//   `country` below — again only ever surfaced as a computed range once at least
//   `MIN_ANONYMIZED_SAMPLE_SIZE` members contributed to that specific node (+country) pool, never
//   as an individual figure.
// NOTE: the actual write path into `compensation_declaration` is now `Experience.grossAnnualSalary`
// (per-experience, see that field's own doc comment), not this field — this field remains for
// the member's own benchmark comparison only, per the owner's decision to model the trigger at
// the experience level instead of a single profile-wide figure.
export interface CurrentCompensation {
  readonly amount: number;
  // ISO 4217 currency code (e.g. "CHF", "EUR") — free text input, not a hardcoded list, since
  // OEI members span many countries.
  readonly currency: string;
  readonly period: CompensationPeriod;
  // Free-text country label, same format as `NetworkExpert.country` (e.g. "Suisse", "France") —
  // kept consistent with that field rather than an ISO code since the rest of this codebase's
  // country data (network graph demo experts, member directory) is plain localized country
  // names, not codes. Optional: a member can decline to state a country, in which case their
  // declaration only contributes to the country-agnostic (global) aggregate, never to a
  // per-country one.
  readonly country?: string;
}

export interface ProfessionalProfile {
  readonly memberId: string;
  /**
   * Indicates how the profile content was initially obtained.
   * MANUAL: wizard. LINKEDIN_BASIC: LinkedIn identity OAuth.
   * CV_IMPORTED: AI-assisted CV import. LINKEDIN_AND_CV: both.
   * Null for legacy accounts created before the import-first onboarding.
   */
  readonly source?: 'MANUAL' | 'LINKEDIN_BASIC' | 'CV_IMPORTED' | 'LINKEDIN_AND_CV' | null;
  // Set from the onboarding wizard's "Photo" step (`espaceMembre.onboarding.steps.photo`,
  // `onboarding.ts`'s `photoUrl` draft field) or edited later from the profile page itself.
  // No real upload pipeline exists yet — this is a plain URL, exactly like the onboarding
  // step it comes from.
  readonly photoUrl?: string;
  readonly title?: string;
  readonly summary?: string;
  readonly location?: string;
  readonly availability?: Availability;
  readonly expertiseAreas: readonly string[];
  readonly technologies: readonly string[];
  readonly sectors: readonly string[];
  readonly languages: readonly LanguageProficiency[];
  readonly experiences: readonly Experience[];
  readonly educations: readonly Education[];
  readonly skills: readonly Skill[];
  readonly socialLinks?: SocialLinks;
  readonly currentCompensation?: CurrentCompensation;
  readonly completenessScore: number;
}

export function createProfessionalProfile(fields: ProfessionalProfile): ProfessionalProfile {
  return Object.freeze({ ...fields });
}

// Mirrors the fields the completeness score in `ProfessionalProfile.completenessScore`
// is computed from server-side. Kept here (rather than hardcoded in the component) so
// the onboarding wizard and the profile page agree on what "complete" means.
export const PROFILE_COMPLETENESS_FIELDS = [
  'title',
  'summary',
  'location',
  'availability',
  'expertiseAreas',
  'languages',
  'experiences',
  'educations',
  'skills',
] as const;

export function computeCompletenessScore(profile: ProfessionalProfile): number {
  const total = PROFILE_COMPLETENESS_FIELDS.length;
  let filled = 0;
  for (const field of PROFILE_COMPLETENESS_FIELDS) {
    const value = profile[field];
    if (Array.isArray(value) ? value.length > 0 : Boolean(value)) {
      filled += 1;
    }
  }
  return Math.round((filled / total) * 100);
}
