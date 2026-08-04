import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AdminContentApplicationService } from './admin-content-application.service';
import { ADMIN_CONTENT_PORT, AdminContentPort } from '../../domain/port/cms/admin-content.port';
import { createContent } from '../../domain/model/cms/content.model';

describe('AdminContentApplicationService', () => {
  function createService(port: Partial<AdminContentPort>): AdminContentApplicationService {
    TestBed.configureTestingModule({ providers: [{ provide: ADMIN_CONTENT_PORT, useValue: port }] });
    return TestBed.inject(AdminContentApplicationService);
  }

  it('givenList_whenCalled_thenDelegatesToPort', async () => {
    const list = vi.fn().mockReturnValue(of([]));
    const service = createService({ list });

    await firstValueFrom(service.list({ type: 'ARTICLE' }));

    expect(list).toHaveBeenCalledWith({ type: 'ARTICLE' });
  });

  it('givenContent_whenAvailableActionsQueried_thenDelegatesToWorkflowDomainLogic', () => {
    const service = createService({});
    const draft = createContent({
      id: 'c1',
      type: 'PAGE',
      slug: 's',
      sourceType: 'CMS',
      title: 'T',
      tags: [],
      governance: { approvalRequired: false, decisionId: null },
      currentVersionId: null,
      status: 'DRAFT',
    });

    expect(service.availableActions(draft)).toEqual(['submit']);
  });

  it('givenSubmit_whenCalled_thenDelegatesToPortWithContentId', async () => {
    const submit = vi.fn().mockReturnValue(of({ status: 'IN_REVIEW' }));
    const service = createService({ submit });

    await firstValueFrom(service.submit('c1'));

    expect(submit).toHaveBeenCalledWith('c1');
  });
});
