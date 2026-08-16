import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminTranslations } from './admin-translations';
import { AdminTranslationsApplicationService } from '../../../../application/service/admin-translations-application.service';

describe('AdminTranslations', () => {
  it('givenMissingRows_whenCreated_thenRendersOneRowPerKey', async () => {
    const rows = [
      {
        key: 'nav.home',
        frValue: 'Accueil',
        statusByLanguage: { en: 'missing', es: 'ok', de: 'ok', it: 'ok', pt: 'ok' } as const,
      },
    ];

    TestBed.configureTestingModule({
      imports: [AdminTranslations],
      providers: [
        {
          provide: AdminTranslationsApplicationService,
          useValue: { list: () => of(rows), missingOnly: (r: typeof rows) => r },
        },
      ],
    });

    const fixture = TestBed.createComponent(AdminTranslations);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rowEls = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rowEls.length).toBe(1);
  });
});
