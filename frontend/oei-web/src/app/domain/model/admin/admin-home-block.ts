// Admin-managed configuration of the home page's sections (task brief §CMS "blocs-home"). `key`
// identifies which real home section this row maps to (see `Home`/`home.html`'s hero/stats/
// domainAreas/latestNews/partners/resources sections) — purely descriptive, this admin screen
// never wires back into `HomeSectionsApplicationService` or `Home` itself (see
// `AdminHomeBlocksMockAdapter`'s doc comment).
export type HomeBlockKey = 'hero' | 'stats' | 'domainAreas' | 'latestNews' | 'partners' | 'resources';

export interface HomeBlockConfig {
  readonly id: string;
  readonly key: HomeBlockKey;
  readonly label: string;
  readonly order: number;
  readonly active: boolean;
}

export function createHomeBlockConfig(input: Partial<HomeBlockConfig> & Pick<HomeBlockConfig, 'id' | 'key'>): HomeBlockConfig {
  return {
    id: input.id,
    key: input.key,
    label: input.label ?? '',
    order: input.order ?? 0,
    active: input.active ?? true,
  };
}
