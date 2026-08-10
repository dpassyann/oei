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
// endpoint. Its only purpose is to let the member compare their own situation against the
// anonymized aggregate range computed by `SalaryBenchmarkService` — the member's own figure is
// used locally for that comparison and is not itself part of any aggregate exposed to others.
export interface CurrentCompensation {
  readonly amount: number;
  // ISO 4217 currency code (e.g. "CHF", "EUR") — free text input, not a hardcoded list, since
  // OEI members span many countries.
  readonly currency: string;
  readonly period: CompensationPeriod;
}

export interface ProfessionalProfile {
  readonly memberId: string;
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
