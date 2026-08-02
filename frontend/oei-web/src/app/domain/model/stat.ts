export interface Stat {
  readonly label: string;
  readonly value: number;
}

export function createStat(fields: Stat): Stat {
  return Object.freeze({ ...fields });
}
