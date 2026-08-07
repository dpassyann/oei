import { afterRenderEffect, Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MarkdownDocumentApplicationService } from '../../../application/service/markdown-document-application.service';
import {
  extractHeadings,
  MarkdownRenderService,
  stripFrontmatter,
} from '../../../application/service/markdown-render.service';
import { I18nService } from '../../i18n/i18n.service';
import {
  FloatingSideMenu,
  FloatingSideMenuLink,
} from '../../components/floating-side-menu/floating-side-menu';
import { renderMermaidDiagrams } from './mermaid-loader';

// Source path relative to a `content/<lang>/` folder — see `content/fr/200-WHITE-PAPERS/
// livre-blanc-complet.md` (the only language with a real file today; the others only have
// `.gitkeep` placeholders, hence the repli-FR handled by `MarkdownAssetAdapter`).
const LIVRE_BLANC_PATH = '200-WHITE-PAPERS/livre-blanc-complet.md';

// Final PDF, provided by the user and copied verbatim (never regenerated here) from
// `.prompt/Livre-Blanc-OEI-v3.2.pdf` to `public/assets/livre-blanc/livre-blanc-oei.pdf`.
const LIVRE_BLANC_PDF_HREF = '/assets/livre-blanc/livre-blanc-oei.pdf';

@Component({
  selector: 'oei-livre-blanc',
  imports: [RouterLink, FloatingSideMenu],
  templateUrl: './livre-blanc.html',
  styleUrl: './livre-blanc.scss',
})
export class LivreBlanc {
  private readonly markdownDocuments = inject(MarkdownDocumentApplicationService);
  private readonly markdownRender = inject(MarkdownRenderService);
  protected readonly i18n = inject(I18nService);

  protected readonly pdfHref = LIVRE_BLANC_PDF_HREF;

  private readonly documentResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) => this.markdownDocuments.getMarkdownDocument(LIVRE_BLANC_PATH, params),
  });

  protected readonly loading = computed(() => this.documentResource.isLoading());
  protected readonly notFound = computed(() => this.documentResource.error() !== undefined);
  protected readonly isFallback = computed(
    () => this.documentResource.value()?.isFallback ?? false,
  );

  // The Markdown source (front matter stripped: it's metadata — title/version/status/date —
  // not document body) is rendered exactly once per language change here, not on every
  // template read, since both the HTML and the table of contents are derived from it.
  private readonly bodyMarkdown = computed(() =>
    stripFrontmatter(this.documentResource.value()?.body ?? ''),
  );

  // No 1ère/4ème de couverture to strip: the source Markdown never contained them (see plan) —
  // rendering starts from `# Livre Blanc` as-is.
  //
  // Uses `renderTrustedToSafeHtml` (not `renderToSafeHtml`): the Markdown source is this repo's
  // own version-controlled `content/fr/200-WHITE-PAPERS/livre-blanc-complet.md`, never
  // user-submitted, and `DomSanitizer.sanitize` strips `id` attributes outright (it isn't on
  // Angular's `VALID_ATTRS` allowlist), which would silently break every `##`/`###` anchor the
  // floating side menu links to. See that method's doc comment for why this is safe here and
  // would NOT be safe for CMS-contributed content.
  protected readonly contentHtml = computed(() =>
    this.markdownRender.renderTrustedToSafeHtml(this.bodyMarkdown(), {
      headingIds: true,
      mermaid: 'diagram',
    }),
  );

  private readonly bodyElement = viewChild<ElementRef<HTMLElement>>('body');

  // Re-runs after every DOM update caused by `contentHtml()` changing (language switch, initial
  // load): Mermaid needs the real `pre.mermaid` elements to exist in the DOM before it can read
  // their source and replace them with rendered SVGs, which `[innerHTML]` bindings only
  // guarantee once Angular has actually applied the change — hence `afterRenderEffect` rather
  // than a plain `effect()`, which would run before the DOM reflects the new `contentHtml()`.
  constructor() {
    afterRenderEffect(() => {
      this.contentHtml();
      const element = this.bodyElement()?.nativeElement;
      if (element) {
        void renderMermaidDiagrams(element);
      }
    });
  }

  // Side menu: only top-level (`##`) headings, per the plan ("pas besoin de descendre aux
  // ### sinon il sera trop long") — `###` still get anchors in `contentHtml` above, just not
  // listed here.
  protected readonly sideMenuLinks = computed<FloatingSideMenuLink[]>(() =>
    extractHeadings(this.bodyMarkdown(), [2]).map((heading) => ({
      label: heading.text,
      fragment: heading.slug,
    })),
  );
}
