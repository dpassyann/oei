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

// Source path relative to a `content/<lang>/` folder — see `content/fr/300-STANDARDS/` (only
// `fr` has real content today, same repli-FR convention as `a-propos.ts`/the Livre Blanc page).
const CODE_DE_DEONTOLOGIE_PATH = '300-STANDARDS/code-de-deontologie.md';

@Component({
  selector: 'oei-deontologie',
  imports: [FloatingSideMenu],
  templateUrl: './deontologie.html',
  styleUrl: './deontologie.scss',
})
export class Deontologie {
  private readonly markdownDocuments = inject(MarkdownDocumentApplicationService);
  private readonly markdownRender = inject(MarkdownRenderService);
  protected readonly i18n = inject(I18nService);

  private readonly codeResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) =>
      this.markdownDocuments.getMarkdownDocument(CODE_DE_DEONTOLOGIE_PATH, params),
  });

  protected readonly loading = computed(() => this.codeResource.isLoading());
  protected readonly notFound = computed(() => this.codeResource.error() !== undefined);
  protected readonly isFallback = computed(() => this.codeResource.value()?.isFallback ?? false);

  private readonly codeMarkdown = computed(() =>
    stripFrontmatter(this.codeResource.value()?.body ?? ''),
  );

  protected readonly codeHtml = computed(() =>
    this.markdownRender.renderTrustedToSafeHtml(this.codeMarkdown(), { headingIds: true }),
  );

  protected readonly sideMenuLinks = computed<FloatingSideMenuLink[]>(() =>
    extractHeadings(this.codeMarkdown(), [2]).map((heading) => ({
      label: heading.text,
      fragment: heading.slug,
    })),
  );
}
