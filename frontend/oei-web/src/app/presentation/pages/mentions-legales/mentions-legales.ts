import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
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

// Source path relative to a `content/<lang>/` folder — see `content/fr/900-LEGAL/
// statut-juridique.md` (the only language with a real file today, same repli-FR convention as
// the Livre Blanc page).
const STATUT_JURIDIQUE_PATH = '900-LEGAL/statut-juridique.md';

@Component({
  selector: 'oei-mentions-legales',
  imports: [FloatingSideMenu],
  templateUrl: './mentions-legales.html',
  styleUrl: './mentions-legales.scss',
})
export class MentionsLegales {
  private readonly markdownDocuments = inject(MarkdownDocumentApplicationService);
  private readonly markdownRender = inject(MarkdownRenderService);
  protected readonly i18n = inject(I18nService);

  private readonly documentResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) =>
      this.markdownDocuments.getMarkdownDocument(STATUT_JURIDIQUE_PATH, params),
  });

  protected readonly loading = computed(() => this.documentResource.isLoading());
  protected readonly notFound = computed(() => this.documentResource.error() !== undefined);
  protected readonly isFallback = computed(
    () => this.documentResource.value()?.isFallback ?? false,
  );

  private readonly bodyMarkdown = computed(() =>
    stripFrontmatter(this.documentResource.value()?.body ?? ''),
  );

  protected readonly contentHtml = computed(() =>
    this.markdownRender.renderTrustedToSafeHtml(this.bodyMarkdown(), { headingIds: true }),
  );

  // `statut-juridique.md` has 6 `##` sections (Ce que l'OEI est aujourd'hui / La structure à
  // deux niveaux / Ambition internationale et réalité juridique / Ce que l'OEI ne peut pas
  // faire aujourd'hui / Trajectoire envisagée / Avertissement) — well past the "long enough to
  // warrant a floating side menu" threshold from the plan.
  protected readonly sideMenuLinks = computed<FloatingSideMenuLink[]>(() =>
    extractHeadings(this.bodyMarkdown(), [2]).map((heading) => ({
      label: heading.text,
      fragment: heading.slug,
    })),
  );
}
