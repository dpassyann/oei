import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { I18nService } from '../../i18n/i18n.service';

export type ResourceCarouselItemType =
  | 'white-paper'
  | 'code-of-ethics'
  | 'competency-framework'
  | 'position-paper'
  | 'report';

export interface ResourceCarouselItem {
  readonly key: string;
  readonly type: ResourceCarouselItemType;
  readonly coverImageUrl: string | null;
  readonly coverAlt: string | null;
  readonly version: string | null;
  readonly language: string | null;
  readonly fileSizeBytes: number | null;
  /** `'email'` scrolls to/focuses the caller's download form, `'view'` navigates via `routerLink`,
   * `'pending'` renders no call to action (see `ressources.resourceList.pendingBadge`). */
  readonly cta: 'email' | 'view' | 'pending';
  readonly routerLink?: string;
  readonly fragment?: string;
}

const AUTOPLAY_INTERVAL_MS = 6000;

function detectReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// Vignette carousel for `/ressources` (see plan doc 02-DYNAMIC-NEWS-GLOBAL-SEARCH-RESOURCES).
// Deliberately built with plain CSS transforms + an RxJS `interval` rather than a carousel
// library — the item count and interaction surface here are small, and this keeps the same
// "light, hand-rolled animation" spirit as `hero-globe`/`floating-side-menu`.
@Component({
  selector: 'oei-resource-carousel',
  imports: [RouterLink],
  templateUrl: './resource-carousel.html',
  styleUrl: './resource-carousel.scss',
})
export class ResourceCarousel {
  protected readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = input.required<readonly ResourceCarouselItem[]>();

  // Set by the caller while its own email field (outside this component — the shared
  // download form on `/ressources`) has focus, or mid-submission. See `Ressources`.
  readonly externalPause = input<boolean>(false);

  readonly emailCtaSelected = output<string>();

  protected readonly activeIndex = signal(0);
  private readonly hoverPaused = signal(false);
  private readonly focusPaused = signal(false);
  private readonly reducedMotion = signal(detectReducedMotion());

  protected readonly isPaused = computed(
    () => this.externalPause() || this.hoverPaused() || this.focusPaused() || this.reducedMotion(),
  );

  private timerSubscription: Subscription | undefined;

  constructor() {
    effect(() => {
      const paused = this.isPaused();
      const count = this.items().length;
      this.timerSubscription?.unsubscribe();
      if (paused || count <= 1) {
        return;
      }
      this.timerSubscription = interval(AUTOPLAY_INTERVAL_MS).subscribe(() => {
        this.activeIndex.update((index) => (index + 1) % count);
      });
    });
    this.destroyRef.onDestroy(() => this.timerSubscription?.unsubscribe());
  }

  protected onMouseEnter(): void {
    this.hoverPaused.set(true);
  }

  protected onMouseLeave(): void {
    this.hoverPaused.set(false);
  }

  protected onFocusIn(): void {
    this.focusPaused.set(true);
  }

  protected onFocusOut(): void {
    this.focusPaused.set(false);
  }

  protected goTo(index: number): void {
    this.activeIndex.set(index);
  }

  protected previous(): void {
    const count = this.items().length;
    this.activeIndex.update((index) => (index - 1 + count) % count);
  }

  protected next(): void {
    const count = this.items().length;
    this.activeIndex.update((index) => (index + 1) % count);
  }

  protected selectEmailCta(key: string): void {
    this.emailCtaSelected.emit(key);
  }

  protected typeLabel(type: ResourceCarouselItemType): string {
    const key = {
      'white-paper': 'whitePaper',
      'code-of-ethics': 'codeOfEthics',
      'competency-framework': 'competencyFramework',
      'position-paper': 'positionPaper',
      report: 'report',
    }[type];
    return this.i18n.translate(`resourceCarousel.type.${key}`);
  }

  protected languageLabel(languageCode: string): string {
    try {
      return new Intl.DisplayNames([this.i18n.currentLang()], { type: 'language' }).of(languageCode) ?? languageCode;
    } catch {
      return languageCode;
    }
  }

  protected fileSizeLabel(bytes: number): string {
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(0)} ${this.i18n.translate('resourceCarousel.unitKb')}`;
    }
    return `${(kb / 1024).toFixed(1)} ${this.i18n.translate('resourceCarousel.unitMb')}`;
  }
}
