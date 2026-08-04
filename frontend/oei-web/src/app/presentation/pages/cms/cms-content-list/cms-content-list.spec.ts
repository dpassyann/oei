import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CmsContentList } from './cms-content-list';
import { AdminContentApplicationService } from '../../../../application/service/admin-content-application.service';
import { GitSynchronizationApplicationService } from '../../../../application/service/git-synchronization-application.service';
import { createContent } from '../../../../domain/model/cms/content.model';
import { I18nService } from '../../../i18n/i18n.service';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

function demoContent() {
  return createContent({
    id: 'c1',
    type: 'ARTICLE',
    slug: 's',
    sourceType: 'CMS',
    title: 'Titre de démonstration',
    tags: [],
    governance: { approvalRequired: false, decisionId: null },
    currentVersionId: null,
    status: 'DRAFT',
  });
}

describe('CmsContentList', () => {
  function configure(options?: { contents?: ReturnType<typeof demoContent>[]; trigger?: ReturnType<typeof vi.fn> }) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: AdminContentApplicationService, useValue: { list: vi.fn().mockReturnValue(of(options?.contents ?? [])) } },
        {
          provide: GitSynchronizationApplicationService,
          useValue: { list: vi.fn().mockReturnValue(of([])), trigger: options?.trigger ?? vi.fn().mockReturnValue(of({})) },
        },
      ],
    });
  }

  it('givenContentsFromService_whenRendered_thenListsThemInTheTable', async () => {
    configure({ contents: [demoContent()] });
    const fixture = TestBed.createComponent(CmsContentList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Titre de démonstration');
  });

  it('givenNoContents_whenRendered_thenShowsEmptyMessage', async () => {
    configure({ contents: [] });
    const fixture = TestBed.createComponent(CmsContentList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.oei-cms-list__empty')).not.toBeNull();
  });

  it('givenTypeFilterChanged_whenSet_thenServiceIsCalledAgainWithNewCriteria', async () => {
    const list = vi.fn().mockReturnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: AdminContentApplicationService, useValue: { list } },
        { provide: GitSynchronizationApplicationService, useValue: { list: vi.fn().mockReturnValue(of([])), trigger: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(CmsContentList);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.onTypeFilterChange('ARTICLE');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(list).toHaveBeenCalledWith(expect.objectContaining({ type: 'ARTICLE' }));
  });

  it('givenTriggerSynchronization_whenCalled_thenInvokesGitSyncService', async () => {
    const trigger = vi.fn().mockReturnValue(of({ id: 'sync-2', status: 'SUCCESS' }));
    configure({ trigger });
    const fixture = TestBed.createComponent(CmsContentList);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.triggerSynchronization();

    expect(trigger).toHaveBeenCalled();
  });
});
