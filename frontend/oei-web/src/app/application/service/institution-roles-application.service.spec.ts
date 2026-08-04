import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { InstitutionRolesApplicationService } from './institution-roles-application.service';
import { INSTITUTION_ROLES_PORT, InstitutionRolesPort } from '../../domain/port/institution/institution-roles.port';
import { DEMO_MEMBERSHIPS } from '../../infrastructure/adapter/institution-demo-data';

describe('InstitutionRolesApplicationService', () => {
  function setup(port: Partial<InstitutionRolesPort>) {
    TestBed.configureTestingModule({ providers: [{ provide: INSTITUTION_ROLES_PORT, useValue: port }] });
    return TestBed.inject(InstitutionRolesApplicationService);
  }

  it('whenListRoleAssignments_thenDelegatesToPort', async () => {
    const service = setup({ listRoleAssignments: () => of([...DEMO_MEMBERSHIPS]) });
    const memberships = await firstValueFrom(service.listRoleAssignments());
    expect(memberships).toEqual(DEMO_MEMBERSHIPS);
  });

  it('whenUpdateRoleAssignment_thenForwardsMemberIdAndRole', async () => {
    let received: unknown;
    const service = setup({
      updateRoleAssignment: (memberId, role) => {
        received = { memberId, role };
        return of(DEMO_MEMBERSHIPS[0]);
      },
    });
    await firstValueFrom(service.updateRoleAssignment('member-admin-demo', 'HR'));
    expect(received).toEqual({ memberId: 'member-admin-demo', role: 'HR' });
  });
});
