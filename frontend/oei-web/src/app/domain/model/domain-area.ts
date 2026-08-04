export interface DomainArea {
  readonly slug: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  /** ISO 8601 date string — when this domain's content was last edited. */
  readonly lastModified: string;
}

export function createDomainArea(fields: DomainArea): DomainArea {
  return Object.freeze({ ...fields });
}
