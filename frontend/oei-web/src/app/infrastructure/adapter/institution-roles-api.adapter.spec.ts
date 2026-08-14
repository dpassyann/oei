import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionRolesApiAdapter } from './institution-roles-api.adapter';
import { DEMO_MEMBERSHIPS } from './institution-demo-data';

describe('InstitutionRolesApiAdapter', () => {
  function createAdapter(): { adapter: InstitutionRolesApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [InstitutionRolesApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(InstitutionRolesApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('whenListRoleAssignments_thenCallsRolesEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listRoleAssignments());
    httpMock.expectOne('/api/institution/v1/roles').flush(DEMO_MEMBERSHIPS);
    await result;
    httpMock.verify();
  });

  it('whenUpdateRoleAssignment_thenCallsPutWithRoleBody', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.updateRoleAssignment('member-admin-demo', 'HR'));
    const req = httpMock.expectOne('/api/institution/v1/roles/member-admin-demo');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ role: 'HR' });
    req.flush(DEMO_MEMBERSHIPS[0]);
    await result;
    httpMock.verify();
  });

  it('whenRemoveRoleAssignment_thenCallsDelete', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.removeRoleAssignment('member-admin-demo'));
    const req = httpMock.expectOne('/api/institution/v1/roles/member-admin-demo');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await result;
    httpMock.verify();
  });
});
