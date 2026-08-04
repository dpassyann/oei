import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { CvApplicationService } from './cv-application.service';
import { CV_PORT } from '../../domain/port/cv/cv.port';
import { CvPort } from '../../domain/port/cv/cv.port';
import { createCv } from '../../domain/model/cv/cv';

describe('CvApplicationService', () => {
  function setup(fakePort: CvPort) {
    TestBed.configureTestingModule({ providers: [{ provide: CV_PORT, useValue: fakePort }] });
    return TestBed.inject(CvApplicationService);
  }

  it('givenPortReturnsCv_whenGetCv_thenForwardsIdAndReturnsIt', async () => {
    const expected = createCv({
      id: 'cv-1',
      memberId: 'demo-member-1',
      templateId: 'tpl-classic',
      sourceLanguage: 'fr',
      status: 'DRAFT',
      sections: [],
    });
    let receivedId: string | undefined;
    const service = setup({
      listTemplates: () => of([]),
      listCvs: () => of([]),
      getCv: (id) => {
        receivedId = id;
        return of(expected);
      },
      createCv: () => of(expected),
      updateCv: () => of(expected),
      addSection: () => {
        throw new Error('not used');
      },
      updateSection: () => {
        throw new Error('not used');
      },
      addTranslation: () => {
        throw new Error('not used');
      },
      validateTranslation: () => {
        throw new Error('not used');
      },
      renderCv: () => {
        throw new Error('not used');
      },
    });
    const cv = await firstValueFrom(service.getCv('cv-1'));
    expect(receivedId).toBe('cv-1');
    expect(cv).toEqual(expected);
  });

  it('givenPortReturnsTranslation_whenAddTranslation_thenForwardsAllArgumentsInOrder', async () => {
    const expectedTranslation = {
      id: 'translation-1',
      sectionId: 'section-1',
      language: 'en',
      content: {},
      status: 'MACHINE_GENERATED' as const,
      translatedAt: '2026-01-01T00:00:00Z',
    };
    let receivedArgs: unknown[] = [];
    const service = setup({
      listTemplates: () => of([]),
      listCvs: () => of([]),
      getCv: () => {
        throw new Error('not used');
      },
      createCv: () => {
        throw new Error('not used');
      },
      updateCv: () => {
        throw new Error('not used');
      },
      addSection: () => {
        throw new Error('not used');
      },
      updateSection: () => {
        throw new Error('not used');
      },
      addTranslation: (cvId, sectionId, translation) => {
        receivedArgs = [cvId, sectionId, translation];
        return of(expectedTranslation);
      },
      validateTranslation: () => {
        throw new Error('not used');
      },
      renderCv: () => {
        throw new Error('not used');
      },
    });
    const translation = await firstValueFrom(
      service.addTranslation('cv-1', 'section-1', { language: 'en', content: {} }),
    );
    expect(receivedArgs).toEqual(['cv-1', 'section-1', { language: 'en', content: {} }]);
    expect(translation).toEqual(expectedTranslation);
  });
});
