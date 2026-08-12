import { CompensationPeriod } from '../profile/professional-profile';

// Kinds of graph node the Professional Neural Network's salary transparency feature can attach
// an anonymized aggregate to. Deliberately excludes `'expert'` — an individual member is never
// the subject of an aggregate, only ever a (never-individually-visible) contributor to one; see
// `CurrentCompensation`'s doc comment in `professional-profile.ts`.
export type NetworkSalaryNodeType = 'domain' | 'topic' | 'certification';

// Anonymized salary range aggregated over member `CurrentCompensation` declarations attached to
// one graph node (a domain, topic, or certification), optionally narrowed to one country.
// Aggregate only — `sampleSize` lets the UI show "based on N declarations" without ever exposing
// which members contributed. Resolves to `undefined` (see `NetworkGraphPort.getSalaryInsight`)
// rather than existing with a `sampleSize` below `MIN_ANONYMIZED_SAMPLE_SIZE` — there is no
// "low-confidence" range, only "range" or "not enough data yet".
export interface NetworkSalaryInsight {
  readonly low: number;
  readonly high: number;
  readonly currency: string;
  readonly period: CompensationPeriod;
  readonly sampleSize: number;
  readonly country?: string;
}

// Small, fixed vocabulary of countries the demo salary dataset spans (see
// `NetworkGraphMockAdapter`'s salary insight generation) — used by
// `NetworkDossierPanel` to offer a simple country selector without a dedicated "list countries
// with data for this node" endpoint, which doesn't exist yet (and isn't needed while the
// candidate list stays this small). A real backend would either expose that enumeration itself
// or the panel would derive it from whatever countries the insight response already mentions;
// out of scope until real salary declarations exist server-side.
export const NETWORK_SALARY_INSIGHT_CANDIDATE_COUNTRIES = ['Suisse', 'France'] as const;
