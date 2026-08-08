import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MarkdownDocumentApplicationService } from '../../../application/service/markdown-document-application.service';
import {
  MarkdownRenderService,
  stripFrontmatter,
} from '../../../application/service/markdown-render.service';
import { I18nService } from '../../i18n/i18n.service';

// Source paths relative to a `content/<lang>/` folder — see `content/fr/600-COMMUNICATION/`
// (only `fr` has real files today, same repli-FR convention as the Livre Blanc page).
const CONTACT_INSTITUTIONNEL_PATH = '600-COMMUNICATION/contact-institutionnel.md';
const APPEL_A_CONTRIBUTION_PATH = '600-COMMUNICATION/appel-a-contribution.md';

@Component({
  selector: 'oei-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly markdownDocuments = inject(MarkdownDocumentApplicationService);
  private readonly markdownRender = inject(MarkdownRenderService);
  protected readonly i18n = inject(I18nService);
  protected readonly contactEmail = 'contact@oei-experts.org';

  // Two additive blocks below the existing mailto contact, each fetched independently (same
  // `rxResource` pattern as `livre-blanc.ts`, instantiated twice — see `a-propos.ts` for the
  // same choice). No floating side menu and no hard "not found" gate on either block: the
  // mailto contact above already gives every visitor a working way to reach the OEI on its own,
  // so a failed fetch here just renders nothing instead of blocking the page.
  private readonly institutionalResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) =>
      this.markdownDocuments.getMarkdownDocument(CONTACT_INSTITUTIONNEL_PATH, params),
  });
  private readonly contributeResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) =>
      this.markdownDocuments.getMarkdownDocument(APPEL_A_CONTRIBUTION_PATH, params),
  });

  protected readonly institutionalLoading = computed(() => this.institutionalResource.isLoading());
  protected readonly institutionalFallback = computed(
    () => this.institutionalResource.value()?.isFallback ?? false,
  );
  protected readonly institutionalHtml = computed(() =>
    this.markdownRender.renderTrustedToSafeHtml(
      stripFrontmatter(this.institutionalResource.value()?.body ?? ''),
      { headingIds: true },
    ),
  );

  protected readonly contributeLoading = computed(() => this.contributeResource.isLoading());
  protected readonly contributeFallback = computed(
    () => this.contributeResource.value()?.isFallback ?? false,
  );
  protected readonly contributeHtml = computed(() =>
    this.markdownRender.renderTrustedToSafeHtml(
      stripFrontmatter(this.contributeResource.value()?.body ?? ''),
      { headingIds: true },
    ),
  );
}
