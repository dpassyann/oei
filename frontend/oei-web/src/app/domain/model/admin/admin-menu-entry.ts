// Admin-managed navigation entry (task: `.prompt/plan/final/03-ADMIN-CONSOLE.md` §CMS "menus").
// Mirrors, at a data-model level, the two static nav sources the site actually renders today —
// `SiteHeader.navLinks`/`resourceLinks` (zone `header`) and `SiteFooter.legalLinks` (zone
// `footer`) — without this admin CRUD wiring back into either component (see
// `AdminMenusMockAdapter`'s doc comment for why: no real backend-driven nav exists yet).
export type MenuZone = 'header' | 'footer';

export interface MenuEntry {
  readonly id: string;
  // Dotted i18n key resolved by `I18nService.translate` (e.g. `nav.home`) — never a raw label,
  // per the project's i18n golden rule (no hardcoded copy).
  readonly labelKey: string;
  // Target route, always starting with `/` (validated by `AdminMenusApplicationService`).
  readonly route: string;
  readonly order: number;
  readonly zone: MenuZone;
  // Soft-delete flag (task brief: no hard delete UI on admin entities) — an inactive entry is
  // simply excluded from wherever the real site nav would eventually read from this list.
  readonly active: boolean;
}

export function createMenuEntry(input: Partial<MenuEntry> & Pick<MenuEntry, 'id'>): MenuEntry {
  return {
    id: input.id,
    labelKey: input.labelKey ?? '',
    route: input.route ?? '/',
    order: input.order ?? 0,
    zone: input.zone ?? 'header',
    active: input.active ?? true,
  };
}
