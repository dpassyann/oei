import {
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { SEARCH_PORT } from '../../../domain/port/search.port';
import { SearchResult } from '../../../domain/model/search-result';
import { I18nService } from '../../i18n/i18n.service';

// The large expandable search field opened by the header's search icon (see `SiteHeader`).
// V1 scope is deliberately narrow — resources and news only (see `SearchPort`) — so this
// component only ever renders two result groups.
@Component({
  selector: 'oei-global-search',
  imports: [FormsModule],
  templateUrl: './global-search.html',
  styleUrl: './global-search.scss',
})
export class GlobalSearch {
  protected readonly i18n = inject(I18nService);
  private readonly searchPort = inject(SEARCH_PORT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly closed = output<void>();

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly query = signal('');
  protected readonly results = signal<readonly SearchResult[]>([]);

  protected readonly resourceResults = computed(() =>
    this.results().filter((result) => result.type === 'resource'),
  );
  protected readonly newsResults = computed(() =>
    this.results().filter((result) => result.type === 'news'),
  );
  protected readonly hasSearched = computed(() => this.query().trim().length > 0);

  private readonly queryChanges = new Subject<string>();
  private subscription: Subscription | undefined;

  constructor() {
    // Autofocus once the input has actually been rendered (this component only exists in the
    // DOM while the search field is open — see `SiteHeader`'s `@if (isSearchOpen())`), rather
    // than relying on the native `autofocus` attribute, which browsers ignore for elements
    // inserted after initial page load.
    afterRenderEffect(() => {
      this.inputRef()?.nativeElement.focus();
    });

    this.subscription = this.queryChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) =>
          query.trim().length === 0 ? of([]) : this.searchPort.search(query, this.i18n.currentLang()),
        ),
      )
      .subscribe((results) => this.results.set(results));
    this.destroyRef.onDestroy(() => this.subscription?.unsubscribe());
  }

  protected onQueryChange(value: string): void {
    this.query.set(value);
    this.queryChanges.next(value);
  }

  protected close(): void {
    this.closed.emit();
  }

  protected selectResult(result: SearchResult): void {
    void this.router.navigate([result.path], result.fragment ? { fragment: result.fragment } : {});
    this.close();
  }
}
