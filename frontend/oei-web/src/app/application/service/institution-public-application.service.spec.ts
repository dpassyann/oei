import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { InstitutionPublicApplicationService } from './institution-public-application.service';
import { INSTITUTION_PUBLIC_PORT } from '../../domain/port/institution/institution-public.port';
import { createInstitutionPublicPage } from '../../domain/model/institution/institution-public-page';
import { DEMO_INSTITUTION } from '../../infrastructure/adapter/institution-demo-data';

describe('InstitutionPublicApplicationService', () => {
  it('whenGetPublicInstitution_thenForwardsSlugToPort', async () => {
    let receivedSlug: string | undefined;
    const page = createInstitutionPublicPage({ institution: DEMO_INSTITUTION, partnership: null, publications: [], opportunities: [] });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: INSTITUTION_PUBLIC_PORT,
          useValue: {
            getPublicInstitution: (slug: string) => {
              receivedSlug = slug;
              return of(page);
            },
          },
        },
      ],
    });
    const service = TestBed.inject(InstitutionPublicApplicationService);
    const result = await firstValueFrom(service.getPublicInstitution('demo-institution'));
    expect(receivedSlug).toBe('demo-institution');
    expect(result).toEqual(page);
  });
});
