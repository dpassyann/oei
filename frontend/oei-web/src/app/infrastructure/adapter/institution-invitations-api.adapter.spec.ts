import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { InstitutionInvitationsApiAdapter } from './institution-invitations-api.adapter';
import { DEMO_INVITATIONS } from './institution-demo-data';

describe('InstitutionInvitationsApiAdapter', () => {
  function createAdapter(): { adapter: InstitutionInvitationsApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [InstitutionInvitationsApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(InstitutionInvitationsApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('whenListInvitations_thenCallsInvitationsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listInvitations());
    httpMock.expectOne('/api/institution/v1/invitations').flush(DEMO_INVITATIONS);
    await result;
    httpMock.verify();
  });

  it('whenCreateInvitation_thenPostsCreationBody', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.createInvitation({ email: 'nouveau@oei-demo-institution.org', role: 'READER' }));
    const req = httpMock.expectOne('/api/institution/v1/invitations');
    expect(req.request.method).toBe('POST');
    req.flush(DEMO_INVITATIONS[0]);
    await result;
    httpMock.verify();
  });

  it('whenRevokeInvitation_thenPostsToRevokeEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.revokeInvitation('invitation-demo-1'));
    const req = httpMock.expectOne('/api/institution/v1/invitations/invitation-demo-1/revoke');
    expect(req.request.method).toBe('POST');
    req.flush(DEMO_INVITATIONS[0]);
    await result;
    httpMock.verify();
  });
});
