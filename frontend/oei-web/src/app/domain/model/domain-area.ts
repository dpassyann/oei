export interface DomainArea {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

export function createDomainArea(fields: DomainArea): DomainArea {
  return Object.freeze({ ...fields });
}
