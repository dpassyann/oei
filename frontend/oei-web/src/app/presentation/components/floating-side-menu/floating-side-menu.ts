import { afterRenderEffect, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface FloatingSideMenuLink {
  readonly label: string;
  readonly fragment: string;
}

// Generic floating/sticky in-page navigation, reused by every long editorial page (À propos,
// Livre Blanc, Déontologie, domain detail pages, and any future page needing the same pattern)
// — the caller supplies its own list of section links, this component renders them, tracks
// which section is currently in view via `IntersectionObserver`, and highlights that link.
@Component({
  selector: 'oei-floating-side-menu',
  imports: [RouterLink],
  templateUrl: './floating-side-menu.html',
  styleUrl: './floating-side-menu.scss',
})
export class FloatingSideMenu {
  readonly links = input.required<readonly FloatingSideMenuLink[]>();
  readonly title = input<string>('');

  protected readonly activeFragment = signal<string | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private observer: IntersectionObserver | undefined;

  // Re-runs whenever `links()` changes (initial content load, language switch) and after the
  // DOM has actually been updated — the target heading elements (`document.getElementById`)
  // only exist once Angular has rendered the caller's `[innerHTML]` body, hence
  // `afterRenderEffect` rather than a plain `effect()` (same reasoning as `livre-blanc.ts`'s
  // Mermaid re-render).
  constructor() {
    afterRenderEffect(() => {
      const currentLinks = this.links();
      this.observer?.disconnect();
      const elements = currentLinks
        .map((link) => document.getElementById(link.fragment))
        .filter((element): element is HTMLElement => element !== null);
      if (elements.length === 0 || typeof IntersectionObserver === 'undefined') {
        this.activeFragment.set(null);
        return;
      }
      // Narrow "trigger band" roughly under the sticky header rather than the whole viewport:
      // a heading counts as active once it crosses ~25% from the top, until it's about to
      // leave near the bottom — this reads as "the section currently being read", not merely
      // "the section barely visible at the edge of the screen".
      this.observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible.length > 0) {
            this.activeFragment.set(visible[0].target.id);
          }
        },
        { rootMargin: '-25% 0px -65% 0px' },
      );
      elements.forEach((element) => this.observer?.observe(element));
    });
    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }

  // Deep-link/keyboard-safe navigation: `RouterLink`+`fragment` already updates the URL hash,
  // but Angular's router treats a fragment-only change on the *same* route as a same-URL
  // navigation and does not reliably re-trigger anchor scrolling — so the smooth scroll is
  // done directly here rather than relying solely on `withInMemoryScrolling`.
  protected scrollToSection(fragment: string, event: Event): void {
    const target = document.getElementById(fragment);
    if (!target) {
      return;
    }
    event.preventDefault();
    history.pushState(null, '', `#${fragment}`);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.activeFragment.set(fragment);
  }
}
