import { canAccessSection, isAdminRole, visibleSections } from './admin-role';

describe('admin-role', () => {
  describe('isAdminRole', () => {
    it('givenKnownRole_whenChecked_thenReturnsTrue', () => {
      expect(isAdminRole('SUPER_ADMIN')).toBe(true);
      expect(isAdminRole('AUDITOR_READONLY')).toBe(true);
    });

    it('givenUnknownRole_whenChecked_thenReturnsFalse', () => {
      expect(isAdminRole('member')).toBe(false);
    });
  });

  describe('canAccessSection', () => {
    it('givenSuperAdmin_whenAnySection_thenGrantsAccess', () => {
      expect(canAccessSection(['SUPER_ADMIN'], 'menus')).toBe(true);
      expect(canAccessSection(['SUPER_ADMIN'], 'audit-log')).toBe(true);
    });

    it('givenScopedRole_whenOwnSection_thenGrantsAccess', () => {
      expect(canAccessSection(['INSTITUTION_ADMIN_OEI'], 'institutions')).toBe(true);
    });

    it('givenScopedRole_whenUnrelatedSection_thenDeniesAccess', () => {
      expect(canAccessSection(['EVENT_ADMIN'], 'institutions')).toBe(false);
    });

    it('givenAuditorReadonly_whenAuditLogOrDashboard_thenGrantsAccess', () => {
      expect(canAccessSection(['AUDITOR_READONLY'], 'audit-log')).toBe(true);
      expect(canAccessSection(['AUDITOR_READONLY'], 'dashboard')).toBe(true);
    });

    it('givenAuditorReadonly_whenOperationalSection_thenDeniesAccess', () => {
      expect(canAccessSection(['AUDITOR_READONLY'], 'institutions')).toBe(false);
    });

    it('givenNoRoles_whenAnySection_thenDeniesAccess', () => {
      expect(canAccessSection([], 'dashboard')).toBe(false);
    });
  });

  describe('visibleSections', () => {
    it('givenInstitutionAdmin_whenListed_thenReturnsDashboardAndInstitutionsOnly', () => {
      expect(visibleSections(['INSTITUTION_ADMIN_OEI'])).toEqual(['dashboard', 'institutions']);
    });

    it('givenSuperAdmin_whenListed_thenReturnsAllSections', () => {
      expect(visibleSections(['SUPER_ADMIN'])).toEqual([
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
      ]);
    });
  });
});
