// Realm roles granting access to the `/admin` console shell (see
// `.prompt/plan/final/03-ADMIN-CONSOLE.md` §RBAC). Any one of these roles unlocks the shell
// itself (see `presentation/auth/admin.guard.ts`); which *sections* of the sidebar nav a given
// role sees is a separate, finer-grained concern handled by `canAccessSection` below.
export const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'FOUNDATION_ADMIN',
  'CONTENT_ADMIN',
  'INSTITUTION_ADMIN_OEI',
  'EVENT_ADMIN',
  'MEMBERSHIP_SUPPORT',
  'REVIEWER',
  'AUDITOR_READONLY',
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(value: string): value is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value);
}

// Sidebar sections exposed by the admin shell (see `AdminLayout`'s nav and
// `.prompt/plan/final/03-ADMIN-CONSOLE.md` §CMS/§Membres/§Audit).
export const ADMIN_SECTIONS = [
  'dashboard',
  'articles',
  'institutions',
  'members',
  'events',
  'resources',
  'menus',
  'translations',
  'email-templates',
  'home-blocks',
  'audit-log',
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

// Least-privilege permission matrix (task brief: "Principe du moindre privilège"). `SUPER_ADMIN`
// and `FOUNDATION_ADMIN` see everything; the other roles are scoped to the domain their name
// suggests. `AUDITOR_READONLY` only ever sees the audit log (read-only oversight, no operational
// section) plus the dashboard KPIs. This mapping is intentionally a plain object literal (not a
// class) so it stays trivial to unit-test and to read against the RBAC table in the plan.
const FULL_ACCESS: readonly AdminRole[] = ['SUPER_ADMIN', 'FOUNDATION_ADMIN'];

export const SECTION_ROLES: Readonly<Record<AdminSection, readonly AdminRole[]>> = {
  dashboard: [...FULL_ACCESS, 'CONTENT_ADMIN', 'INSTITUTION_ADMIN_OEI', 'EVENT_ADMIN', 'MEMBERSHIP_SUPPORT', 'REVIEWER', 'AUDITOR_READONLY'],
  articles: [...FULL_ACCESS, 'CONTENT_ADMIN', 'REVIEWER'],
  institutions: [...FULL_ACCESS, 'INSTITUTION_ADMIN_OEI'],
  members: [...FULL_ACCESS, 'MEMBERSHIP_SUPPORT'],
  events: [...FULL_ACCESS, 'EVENT_ADMIN'],
  resources: [...FULL_ACCESS, 'CONTENT_ADMIN'],
  menus: [...FULL_ACCESS],
  translations: [...FULL_ACCESS, 'CONTENT_ADMIN'],
  'email-templates': [...FULL_ACCESS],
  'home-blocks': [...FULL_ACCESS, 'CONTENT_ADMIN'],
  'audit-log': [...FULL_ACCESS, 'AUDITOR_READONLY'],
};

/** Whether any of the given (raw, Keycloak-decoded) roles grants access to `section`. Used by the
 * admin shell to filter which sidebar entries render — a UI convenience only: the actual
 * enforcement for any mutating action still happens server-side (task brief §Sécurité: "Aucun
 * contrôle d'accès ne repose seulement sur l'UI"). */
export function canAccessSection(roles: readonly string[], section: AdminSection): boolean {
  const allowed = SECTION_ROLES[section];
  return allowed.some((role) => roles.includes(role));
}

/** Sections visible to at least one of the given roles, in the fixed `ADMIN_SECTIONS` order —
 * used directly by the sidebar nav to build its filtered entry list. */
export function visibleSections(roles: readonly string[]): readonly AdminSection[] {
  return ADMIN_SECTIONS.filter((section) => canAccessSection(roles, section));
}
