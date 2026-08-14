import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AdminAuditLogApiAdapter } from './admin-audit-log-api.adapter';

describe('AdminAuditLogApiAdapter', () => {
  function createAdapter(): { adapter: AdminAuditLogApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [AdminAuditLogApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(AdminAuditLogApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenNoArgs_whenList_thenGetsAuditLogUrlAndUnwrapsMetadata', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.list());
    const req = httpMock.expectOne('/api/admin/v1/audit-log');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 'a1',
        actorId: 'admin-1',
        action: 'INSTITUTION_SUSPENDED',
        targetType: 'Institution',
        targetId: 'i1',
        occurredAt: '2026-01-01T00:00:00Z',
        metadata: { before: { status: 'ACTIVE' }, after: { status: 'SUSPENDED' }, reason: 'fraude', correlationId: 'c1' },
      },
    ]);

    const [entry] = await result;
    expect(entry).toEqual({
      id: 'a1',
      actorId: 'admin-1',
      action: 'INSTITUTION_SUSPENDED',
      targetType: 'Institution',
      targetId: 'i1',
      occurredAt: '2026-01-01T00:00:00Z',
      before: { status: 'ACTIVE' },
      after: { status: 'SUSPENDED' },
      reason: 'fraude',
      correlationId: 'c1',
    });
    httpMock.verify();
  });

  it('givenMissingOptionalFields_whenList_thenDefaultsToEmptyValues', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.list());
    const req = httpMock.expectOne('/api/admin/v1/audit-log');
    req.flush([{ id: 'a1', actorId: 'admin-1', action: 'X', occurredAt: '2026-01-01T00:00:00Z' }]);

    const [entry] = await result;
    expect(entry.targetType).toBe('');
    expect(entry.targetId).toBe('');
    expect(entry.before).toBeNull();
    expect(entry.after).toBeNull();
    expect(entry.reason).toBeNull();
    expect(entry.correlationId).toBe('');
    httpMock.verify();
  });

  it('givenEntry_whenLog_thenReturnsClientConstructedEntryWithoutHttpCall', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = await firstValueFrom(
      adapter.log({ actorId: 'admin-1', action: 'X', targetType: 'Institution', targetId: 'i1', correlationId: 'c1' }),
    );

    expect(result.actorId).toBe('admin-1');
    expect(result.correlationId).toBe('c1');
    httpMock.expectNone('/api/admin/v1/audit-log');
    httpMock.verify();
  });
});
