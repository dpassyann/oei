import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MarkdownDocumentApplicationService } from '../../../application/service/markdown-document-application.service';
import {
  MarkdownRenderService,
  stripFrontmatter,
} from '../../../application/service/markdown-render.service';
import { I18nService } from '../../i18n/i18n.service';

const FEE_TIER_COUNT = 4;

// Source path relative to a `content/<lang>/` folder — see `content/fr/000-VISION/
// membres-fondateurs-intro.md` (only `fr` has a real file today, same repli-FR convention as
// the Livre Blanc page).
const MEMBRES_FONDATEURS_INTRO_PATH = '000-VISION/membres-fondateurs-intro.md';

@Component({
  selector: 'oei-membres-fondateurs',
  imports: [RouterLink],
  templateUrl: './membres-fondateurs.html',
  styleUrl: './membres-fondateurs.scss',
})
export class MembresFondateurs {
  private readonly markdownDocuments = inject(MarkdownDocumentApplicationService);
  private readonly markdownRender = inject(MarkdownRenderService);
  protected readonly i18n = inject(I18nService);
  protected readonly contactEmail = 'contact@oei-experts.org';

  // Only the index range is structural: the fee tier labels/amounts come from
  // `membresFondateurs.feeTiers.tiers.<index>.{label,amount}` (see home.ts's
  // `commitmentIndexes` for the same pattern).
  protected readonly feeTierIndexes = Array.from({ length: FEE_TIER_COUNT }, (_, i) => i);

  // Editorial intro rendered above the (untouched) fee-tiers table. No floating side menu here,
  // unlike `/a-propos` or `/mentions-legales`: the document only has one `##` and two `###`
  // headings, and the page's real focus stays the two-column fee-tiers table below — a side
  // menu would compete with it rather than help navigation. No hard "not found" gate either:
  // this block is additive to an already-complete page (table + founding-status CTA still work
  // on their own), so a failed fetch just renders nothing instead of blocking the page.
  private readonly founderIntroResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) =>
      this.markdownDocuments.getMarkdownDocument(MEMBRES_FONDATEURS_INTRO_PATH, params),
  });

  protected readonly founderIntroLoading = computed(() => this.founderIntroResource.isLoading());
  protected readonly founderIntroFallback = computed(
    () => this.founderIntroResource.value()?.isFallback ?? false,
  );
  protected readonly founderIntroHtml = computed(() =>
    this.markdownRender.renderTrustedToSafeHtml(
      stripFrontmatter(this.founderIntroResource.value()?.body ?? ''),
      { headingIds: true },
    ),
  );
}
