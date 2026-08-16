import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AdminTranslationsMockAdapter } from './admin-translations-mock.adapter';

describe('AdminTranslationsMockAdapter', () => {
  function createAdapter(): { adapter: AdminTranslationsMockAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [AdminTranslationsMockAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(AdminTranslationsMockAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('whenGetDictionaries_thenFetchesAllSixLanguagesAndFlattensNestedKeys', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getDictionaries());

    for (const lang of ['fr', 'en', 'es', 'de', 'it', 'pt']) {
      const req = httpMock.expectOne(`/i18n/${lang}.json`);
      req.flush({ nav: { home: `home-${lang}` } });
    }

    const dictionaries = await result;
    expect(dictionaries.fr['nav.home']).toBe('home-fr');
    expect(dictionaries.en['nav.home']).toBe('home-en');
    httpMock.verify();
  });

  it('givenUpdateValue_whenGetDictionariesAgain_thenOverlayWins', async () => {
    const { adapter, httpMock } = createAdapter();
    await firstValueFrom(adapter.updateValue('en', 'nav.home', 'Overridden'));

    const result = firstValueFrom(adapter.getDictionaries());
    for (const lang of ['fr', 'en', 'es', 'de', 'it', 'pt']) {
      const req = httpMock.expectOne(`/i18n/${lang}.json`);
      req.flush({ nav: { home: `home-${lang}` } });
    }

    const dictionaries = await result;
    expect(dictionaries.en['nav.home']).toBe('Overridden');
    httpMock.verify();
  });
});
