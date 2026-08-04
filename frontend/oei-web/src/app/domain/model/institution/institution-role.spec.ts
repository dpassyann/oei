import { INSTITUTION_ROLES } from './institution-role';

describe('InstitutionRole', () => {
  it('exposesEightInstitutionalRolesMatchingTheKeycloakRealmModel', () => {
    expect(INSTITUTION_ROLES).toEqual([
      'OWNER',
      'ADMIN',
      'HR',
      'TECH_LEAD',
      'COMMS',
      'READER',
      'CONTRIBUTOR',
      'AFFILIATION_VALIDATOR',
    ]);
  });
});
