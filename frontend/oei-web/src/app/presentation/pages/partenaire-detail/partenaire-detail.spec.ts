import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PartenaireDetail } from './partenaire-detail';
import { PartnerApplicationService } from '../../../application/service/partner-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createPartner } from '../../../domain/model/partner';

const INTERFACE_STRINGS: Record<string, string> = {
  'partenaires.backToList': 'Retour à la liste des partenaires',
  'partenaires.visitWebsite': 'Visiter le site',
  'partenaires.notFound': 'Partenaire introuvable.',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

function activatedRouteWithId(id: string) {
  return { paramMap: of(convertToParamMap({ id })) };
}

describe('PartenaireDetail', () => {
  it('givenExistingPartner_whenCreated_thenRendersItsDetails', async () => {
    const partner = createPartner({
      id: 'demo-1',
      name: 'Partenaire de démonstration 1',
      logoUrl: '/assets/partners/demo-1.svg',
      description: 'Description démonstration',
      websiteUrl: 'https://example.org',
      category: 'Démonstration',
    });
    TestBed.configureTestingModule({
      imports: [PartenaireDetail],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithId('demo-1') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: PartnerApplicationService, useValue: { getPartner: () => of(partner), getPartners: () => of([partner]) } },
      ],
    });
    const fixture = TestBed.createComponent(PartenaireDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Partenaire de démonstration 1');
    expect(compiled.textContent).toContain('Description démonstration');
  });

  it('givenUnknownPartner_whenCreated_thenRendersNotFoundMessage', async () => {
    TestBed.configureTestingModule({
      imports: [PartenaireDetail],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteWithId('unknown') },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        {
          provide: PartnerApplicationService,
          useValue: { getPartner: () => throwError(() => new Error('not found')), getPartners: () => of([]) },
        },
      ],
    });
    const fixture = TestBed.createComponent(PartenaireDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('introuvable');
  });
});
