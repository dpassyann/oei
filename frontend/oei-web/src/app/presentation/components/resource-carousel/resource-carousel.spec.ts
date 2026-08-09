import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { ResourceCarousel, ResourceCarouselItem } from './resource-carousel';
import { I18nService } from '../../i18n/i18n.service';

const FAKE_I18N_SERVICE = {
  currentLang: signal('fr'),
  setLang: () => Promise.resolve(),
  translate: (key: string) => key,
  translateList: () => [],
};

const ITEMS: readonly ResourceCarouselItem[] = [
  {
    key: 'livreBlanc',
    type: 'white-paper',
    coverImageUrl: '/assets/livre-blanc/couverture-oei.svg',
    coverAlt: 'cover',
    version: 'v1.0',
    language: 'fr',
    fileSizeBytes: 1_155_484,
    cta: 'email',
  },
  {
    key: 'deontologie',
    type: 'code-of-ethics',
    coverImageUrl: null,
    coverAlt: null,
    version: null,
    language: null,
    fileSizeBytes: null,
    cta: 'view',
    routerLink: '/deontologie',
  },
  {
    key: 'referentiel',
    type: 'competency-framework',
    coverImageUrl: null,
    coverAlt: null,
    version: null,
    language: null,
    fileSizeBytes: null,
    cta: 'pending',
  },
];

function mockMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches, addEventListener: () => undefined, removeEventListener: () => undefined }),
  );
}

describe('ResourceCarousel', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function createFixture(items: readonly ResourceCarouselItem[] = ITEMS) {
    TestBed.configureTestingModule({
      imports: [ResourceCarousel],
      providers: [provideRouter([]), { provide: I18nService, useValue: FAKE_I18N_SERVICE }],
    });
    const fixture = TestBed.createComponent(ResourceCarousel);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    return fixture;
  }

  it('givenPendingItem_whenRendered_thenShowsPendingBadgeAndNoCta', () => {
    mockMatchMedia(false);
    const fixture = createFixture();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.oei-resource-carousel__slide').length).toBe(3);
    expect(compiled.textContent).toContain('ressources.resourceList.pendingBadge');
  });

  it('givenAutoplay_whenIntervalElapses_thenAdvancesToNextSlide', () => {
    mockMatchMedia(false);
    vi.useFakeTimers();
    const fixture = createFixture();

    vi.advanceTimersByTime(6000);
    fixture.detectChanges();

    expect((fixture.componentInstance as unknown as { activeIndex: () => number }).activeIndex()).toBe(1);
  });

  it('givenReducedMotionPreferred_whenCreated_thenNeverAutoplays', () => {
    mockMatchMedia(true);
    vi.useFakeTimers();
    const fixture = createFixture();

    vi.advanceTimersByTime(20000);
    fixture.detectChanges();

    expect((fixture.componentInstance as unknown as { activeIndex: () => number }).activeIndex()).toBe(0);
  });

  it('givenExternalPauseTrue_whenIntervalElapses_thenDoesNotAdvance', () => {
    mockMatchMedia(false);
    vi.useFakeTimers();
    const fixture = createFixture();
    fixture.componentRef.setInput('externalPause', true);
    fixture.detectChanges();

    vi.advanceTimersByTime(6000);
    fixture.detectChanges();

    expect((fixture.componentInstance as unknown as { activeIndex: () => number }).activeIndex()).toBe(0);
  });

  it('givenHoveredCarousel_whenIntervalElapses_thenDoesNotAdvance', () => {
    mockMatchMedia(false);
    vi.useFakeTimers();
    const fixture = createFixture();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector('.oei-resource-carousel')?.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    vi.advanceTimersByTime(6000);
    fixture.detectChanges();

    expect((fixture.componentInstance as unknown as { activeIndex: () => number }).activeIndex()).toBe(0);
  });

  it('givenDotClicked_whenClicked_thenJumpsToThatSlide', () => {
    mockMatchMedia(false);
    const fixture = createFixture();
    const compiled = fixture.nativeElement as HTMLElement;

    const dots = compiled.querySelectorAll<HTMLButtonElement>('.oei-resource-carousel__dot');
    dots[2].click();
    fixture.detectChanges();

    expect((fixture.componentInstance as unknown as { activeIndex: () => number }).activeIndex()).toBe(2);
  });

  it('givenEmailCta_whenClicked_thenEmitsEmailCtaSelectedWithKey', () => {
    mockMatchMedia(false);
    const fixture = createFixture();
    const emitted: string[] = [];
    fixture.componentInstance.emailCtaSelected.subscribe((key) => emitted.push(key));

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.oei-resource-carousel__cta')?.click();

    expect(emitted).toEqual(['livreBlanc']);
  });
});
