import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AdminInstitutionsApiAdapter } from './admin-institutions-api.adapter';

describe('AdminInstitutionsApiAdapter', () => {
  function createAdapter(): { adapter: AdminInstitutionsApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [AdminInstitutionsApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(AdminInstitutionsApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenNoArgs_whenList_thenGetsCollectionUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.list());
    const req = httpMock.expectOne('/api/admin/v1/institutions');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'i1' }]);

    expect((await result)[0].id).toBe('i1');
    httpMock.verify();
  });

  it('givenId_whenGetById_thenGetsDetailUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.getById('i1'));
    httpMock.expectOne('/api/admin/v1/institutions/i1').flush({ id: 'i1' });

    expect((await result).id).toBe('i1');
    httpMock.verify();
  });

  it('givenCreation_whenCreate_thenPostsToCollectionUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(
      adapter.create({
        legalName: 'ACME',
        publicName: 'Acme',
        type: 'company',
        country: 'FR',
        emailDomains: ['acme.fr'],
        primaryContactName: 'Jane',
        institutionAdminEmail: 'jane@acme.fr',
        partnershipLevel: 'STANDARD',
      }),
    );
    const req = httpMock.expectOne('/api/admin/v1/institutions');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'i1' });

    expect((await result).id).toBe('i1');
    httpMock.verify();
  });

  it('givenId_whenApprove_thenPostsToApproveUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.approve('i1'));
    const req = httpMock.expectOne('/api/admin/v1/institutions/i1/approve');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'i1', status: 'APPROVED' });

    expect((await result).status).toBe('APPROVED');
    httpMock.verify();
  });

  it('givenId_whenActivate_thenPostsToActivateUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.activate('i1'));
    const req = httpMock.expectOne('/api/admin/v1/institutions/i1/activate');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'i1', status: 'ACTIVE' });

    expect((await result).status).toBe('ACTIVE');
    httpMock.verify();
  });

  it('givenReason_whenSuspend_thenPostsReasonBody', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.suspend('i1', 'fraude'));
    const req = httpMock.expectOne('/api/admin/v1/institutions/i1/suspend');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ reason: 'fraude' });
    req.flush({ id: 'i1', status: 'SUSPENDED' });

    expect((await result).status).toBe('SUSPENDED');
    httpMock.verify();
  });

  it('givenNoReason_whenSuspend_thenPostsEmptyBody', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.suspend('i1'));
    const req = httpMock.expectOne('/api/admin/v1/institutions/i1/suspend');
    expect(req.request.body).toEqual({});
    req.flush({ id: 'i1', status: 'SUSPENDED' });

    await result;
    httpMock.verify();
  });

  it('givenReason_whenRevoke_thenPostsToRevokeUrlWithReasonBody', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.revoke('i1', 'faux documents'));
    const req = httpMock.expectOne('/api/admin/v1/institutions/i1/revoke');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ reason: 'faux documents' });
    req.flush({ id: 'i1', status: 'REVOKED' });

    expect((await result).status).toBe('REVOKED');
    httpMock.verify();
  });
});
