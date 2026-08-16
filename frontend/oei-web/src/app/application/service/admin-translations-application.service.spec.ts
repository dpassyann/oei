import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { AdminTranslationsApplicationService } from './admin-translations-application.service';
import { ADMIN_TRANSLATIONS_PORT } from '../../domain/port/admin/admin-translations.port';

describe('AdminTranslationsApplicationService', () => {
  function createService(dictionaries: Record<string, Record<string, string>>): AdminTranslationsApplicationService {
    TestBed.configureTestingModule({
      providers: [
        AdminTranslationsApplicationService,
        { provide: ADMIN_TRANSLATIONS_PORT, useValue: { getDictionaries: () => of(dictionaries), updateValue: () => of(undefined) } },
      ],
    });
    return TestBed.inject(AdminTranslationsApplicationService);
  }

  it('givenKeyMissingInEnAndPresentElsewhere_whenList_thenFlagsOnlyEnAsMissing', async () => {
    const service = createService({
      fr: { 'nav.home': 'Accueil' },
      en: {},
      es: { 'nav.home': 'Inicio' },
      de: { 'nav.home': 'Start' },
      it: { 'nav.home': 'Home' },
      pt: { 'nav.home': 'Início' },
    });

    const [row] = await firstValueFrom(service.list());
    expect(row.key).toBe('nav.home');
    expect(row.statusByLanguage.en).toBe('missing');
    expect(row.statusByLanguage.es).toBe('ok');
  });

  it('givenEmptyFrValue_whenList_thenKeyIsSkipped', async () => {
    const service = createService({ fr: { 'nav.empty': '   ' }, en: {}, es: {}, de: {}, it: {}, pt: {} });
    const rows = await firstValueFrom(service.list());
    expect(rows.length).toBe(0);
  });

  it('givenRowsWithAndWithoutGaps_whenMissingOnly_thenFiltersOutFullyTranslatedRows', () => {
    const service = createService({});
    const rows = [
      { key: 'a', frValue: 'A', statusByLanguage: { en: 'ok', es: 'ok', de: 'ok', it: 'ok', pt: 'ok' } as const },
      { key: 'b', frValue: 'B', statusByLanguage: { en: 'missing', es: 'ok', de: 'ok', it: 'ok', pt: 'ok' } as const },
    ];
    expect(service.missingOnly(rows).map((row) => row.key)).toEqual(['b']);
  });
});
