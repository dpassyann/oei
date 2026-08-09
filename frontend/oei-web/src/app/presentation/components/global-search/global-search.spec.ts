import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { GlobalSearch } from './global-search';
import { SEARCH_PORT, SearchPort } from '../../../domain/port/search.port';
import { createSearchResult } from '../../../domain/model/search-result';
import { I18nService } from '../../i18n/i18n.service';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

describe('GlobalSearch', () => {
  function configureWithPort(port: SearchPort): void {
    TestBed.configureTestingModule({
      imports: [GlobalSearch],
      providers: [
        provideRouter([]),
        { provide: SEARCH_PORT, useValue: port },
        { provide: I18nService, useValue: FAKE_I18N_SERVICE },
      ],
    });
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('givenTyping_whenLessThan300msElapsed_thenDoesNotCallSearchYet', () => {
    vi.useFakeTimers();
    const search = vi.fn().mockReturnValue(of([]));
    configureWithPort({ search });
    const fixture = TestBed.createComponent(GlobalSearch);
    fixture.detectChanges();

    (fixture.componentInstance as unknown as { onQueryChange(value: string): void }).onQueryChange('livre');
    vi.advanceTimersByTime(200);

    expect(search).not.toHaveBeenCalled();
  });

  it('givenTyping_whenDebounceElapses_thenCallsSearchWithQueryAndCurrentLang', () => {
    vi.useFakeTimers();
    const search = vi.fn().mockReturnValue(of([]));
    configureWithPort({ search });
    const fixture = TestBed.createComponent(GlobalSearch);
    fixture.detectChanges();

    (fixture.componentInstance as unknown as { onQueryChange(value: string): void }).onQueryChange('livre');
    vi.advanceTimersByTime(300);

    expect(search).toHaveBeenCalledWith('livre', 'fr');
  });

  it('givenResultsOfBothTypes_whenRendered_thenGroupsThemByTypeUnderSeparateHeadings', () => {
    vi.useFakeTimers();
    const results = [
      createSearchResult({ type: 'resource', title: 'Livre Blanc', excerpt: 'e1', path: '/ressources' }),
      createSearchResult({ type: 'news', title: 'Actu 1', excerpt: 'e2', path: '/actualites' }),
    ];
    configureWithPort({ search: () => of(results) });
    const fixture = TestBed.createComponent(GlobalSearch);
    fixture.detectChanges();

    (fixture.componentInstance as unknown as { onQueryChange(value: string): void }).onQueryChange('a');
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const groups = compiled.querySelectorAll('.oei-global-search__group-title');
    expect(groups.length).toBe(2);
    expect(compiled.textContent).toContain('Livre Blanc');
    expect(compiled.textContent).toContain('Actu 1');
  });

  it('givenResult_whenClicked_thenNavigatesAndEmitsClosed', () => {
    vi.useFakeTimers();
    const results = [
      createSearchResult({
        type: 'resource',
        title: 'Livre Blanc',
        excerpt: 'e1',
        path: '/ressources',
        fragment: 'livre-blanc',
      }),
    ];
    configureWithPort({ search: () => of(results) });
    const fixture = TestBed.createComponent(GlobalSearch);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    let closedEmitted = false;
    fixture.componentInstance.closed.subscribe(() => (closedEmitted = true));

    (fixture.componentInstance as unknown as { onQueryChange(value: string): void }).onQueryChange('livre');
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.oei-global-search__result')?.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/ressources'], { fragment: 'livre-blanc' });
    expect(closedEmitted).toBe(true);
  });

  it('givenFieldOpen_whenEscapePressed_thenEmitsClosed', () => {
    configureWithPort({ search: () => of([]) });
    const fixture = TestBed.createComponent(GlobalSearch);
    fixture.detectChanges();
    let closedEmitted = false;
    fixture.componentInstance.closed.subscribe(() => (closedEmitted = true));

    const compiled = fixture.nativeElement as HTMLElement;
    compiled
      .querySelector('.oei-global-search')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(closedEmitted).toBe(true);
  });
});
