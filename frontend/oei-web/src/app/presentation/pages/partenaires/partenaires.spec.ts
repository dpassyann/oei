import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Partenaires } from './partenaires';
import { PartnerApplicationService } from '../../../application/service/partner-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { createPartner, Partner } from '../../../domain/model/partner';

const INTERFACE_STRINGS: Record<string, string> = {
  'partenaires.title': 'Partenaires',
  'partenaires.intro': "Les organisations qui soutiennent le mouvement de l'Ordre International des Experts de l'Informatique.",
  'partenaires.empty': 'Aucun partenaire n’a encore été validé.',
};

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => INTERFACE_STRINGS[key] ?? key,
  translateList: () => [],
};

function fakePartnerService(partners: Partner[]): Pick<PartnerApplicationService, 'getPartners' | 'getPartner'> {
  return {
    getPartners: () => of(partners),
    getPartner: (id) => of(partners.find((partner) => partner.id === id) as Partner),
  };
}

describe('Partenaires', () => {
  function configure(partners: Partner[] = []) {
    TestBed.configureTestingModule({
      imports: [Partenaires],
      providers: [
        provideRouter([]),
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
        { provide: PartnerApplicationService, useValue: fakePartnerService(partners) },
      ],
    });
  }

  it('givenNoPartners_whenCreated_thenRendersHonestEmptyState', async () => {
    configure([]);
    const fixture = TestBed.createComponent(Partenaires);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('Aucun partenaire');
    expect(compiled.querySelector('.oei-partenaires__list')).toBeNull();
  });

  it('givenPartners_whenCreated_thenRendersListWithLinksToDetailPage', async () => {
    const partners = [
      createPartner({
        id: 'demo-1',
        name: 'Partenaire de démonstration 1',
        logoUrl: '/assets/partners/demo-1.svg',
        description: 'Desc',
        websiteUrl: 'https://example.org',
        category: 'Démonstration',
      }),
    ];
    configure(partners);
    const fixture = TestBed.createComponent(Partenaires);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const link = compiled.querySelector<HTMLAnchorElement>('.oei-partenaires__link');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('/partenaires/demo-1');
    expect(compiled.textContent).toContain('Partenaire de démonstration 1');
  });
});
