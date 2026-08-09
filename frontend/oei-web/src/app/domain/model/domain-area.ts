import { NewsItem } from './news-item';

/** One editorial subsection of a domain detail page (e.g. "Threat Landscape", "OEI Position"). */
export interface DomainSection {
  /** Anchor id used both as the URL fragment (`#threat-landscape`) and the side-menu link
   * target — kept identical across languages (only `title`/`paragraphs`/`bullets` are
   * translated) so a deep link keeps working when the reader switches language. */
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly bullets?: readonly string[];
}

/** A resource linked at the bottom of a domain detail page (white paper, code of ethics, guide, study…). */
export interface RelatedResource {
  readonly title: string;
  readonly description: string;
  readonly path: string;
}

export interface DomainArea {
  readonly slug: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  /** ISO 8601 date string — when this domain's content was last edited. */
  readonly lastModified: string;
  /** One-line editorial tagline shown under the page title. Optional: not every language has
   * rich detail-page content yet (see `sections` below). */
  readonly subtitle?: string;
  /** Full editorial body of the domain detail page. Populated for `fr`/`en` only for now (per
   * explicit product decision — these 9 expertise pages are FR/EN-only, unlike the rest of the
   * 6-language site) — `undefined` for the other four languages, in which case the detail page
   * falls back to the English content (see `DomainsMockAdapter.getDomainArea`). */
  readonly sections?: readonly DomainSection[];
  readonly relatedResources?: readonly RelatedResource[];
  readonly relatedNews?: readonly NewsItem[];
  /** `true` when `sections`/`relatedResources`/`relatedNews` were borrowed from the English
   * fixture because the requested language has no rich content of its own yet. */
  readonly isContentFallback?: boolean;
}

export function createDomainArea(fields: DomainArea): DomainArea {
  return Object.freeze({ ...fields });
}
