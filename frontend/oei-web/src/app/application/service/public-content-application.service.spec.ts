import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { PublicContentApplicationService } from './public-content-application.service';
import { PUBLIC_CONTENT_PORT, PublicContentPort } from '../../domain/port/cms/public-content.port';

describe('PublicContentApplicationService', () => {
  function createService(port: Partial<PublicContentPort>): PublicContentApplicationService {
    TestBed.configureTestingModule({ providers: [{ provide: PUBLIC_CONTENT_PORT, useValue: port }] });
    return TestBed.inject(PublicContentApplicationService);
  }

  it('givenSlugAndLang_whenGetPublishedBySlug_thenDelegatesToPort', async () => {
    const getPublishedBySlug = vi.fn().mockReturnValue(of({ id: 'v1' }));
    const service = createService({ getPublishedBySlug });

    await firstValueFrom(service.getPublishedBySlug('slug', 'fr'));

    expect(getPublishedBySlug).toHaveBeenCalledWith('slug', 'fr');
  });
});
